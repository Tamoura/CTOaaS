from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from uuid import uuid4
from jose import JWTError, jwt
import bcrypt
from enum import Enum
import os

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(32).hex())
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

app = FastAPI(
    title="CTOaaS API",
    description="CTO as a Service - Decision-focused CTO platform for non-technical founders",
    version="2.0.0"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Stage(str, Enum):
    IDEA = "idea"
    MVP = "mvp"
    FIRST_CUSTOMERS = "first_customers"
    DUE_DILIGENCE = "due_diligence"

class DecisionStatus(str, Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    SUPERSEDED = "superseded"

class RiskStatus(str, Enum):
    OPEN = "open"
    MITIGATED = "mitigated"
    ACCEPTED = "accepted"
    DEFERRED = "deferred"

class RiskSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    company_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    company_name: str
    org_id: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Organization(BaseModel):
    id: str
    name: str
    created_at: str

class DecisionOptionCreate(BaseModel):
    name: str
    description: str
    pros: list[str] = []
    cons: list[str] = []

class DecisionOption(DecisionOptionCreate):
    id: str

class DecisionCreate(BaseModel):
    title: str
    stage: Stage
    context: str
    options: list[DecisionOptionCreate] = []
    recommendation: Optional[str] = None
    accepted_tradeoffs: Optional[str] = None
    deferred_risks: Optional[str] = None

class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    stage: Optional[Stage] = None
    status: Optional[DecisionStatus] = None
    context: Optional[str] = None
    options: Optional[list[DecisionOptionCreate]] = None
    recommendation: Optional[str] = None
    accepted_tradeoffs: Optional[str] = None
    deferred_risks: Optional[str] = None

class Decision(BaseModel):
    id: str
    org_id: str
    title: str
    stage: Stage
    status: DecisionStatus
    context: str
    options: list[DecisionOption]
    recommendation: Optional[str]
    accepted_tradeoffs: Optional[str]
    deferred_risks: Optional[str]
    created_by: str
    accepted_by: Optional[str]
    accepted_at: Optional[str]
    created_at: str
    updated_at: str

class RiskCreate(BaseModel):
    title: str
    description: str
    severity: RiskSeverity
    likelihood: RiskSeverity
    mitigation: Optional[str] = None
    linked_decision_id: Optional[str] = None
    dependency_type: Optional[str] = None
    dependency_name: Optional[str] = None

class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[RiskSeverity] = None
    likelihood: Optional[RiskSeverity] = None
    status: Optional[RiskStatus] = None
    mitigation: Optional[str] = None
    linked_decision_id: Optional[str] = None
    dependency_type: Optional[str] = None
    dependency_name: Optional[str] = None

class Risk(BaseModel):
    id: str
    org_id: str
    title: str
    description: str
    severity: RiskSeverity
    likelihood: RiskSeverity
    status: RiskStatus
    mitigation: Optional[str]
    linked_decision_id: Optional[str]
    dependency_type: Optional[str]
    dependency_name: Optional[str]
    created_at: str
    updated_at: str

class SessionNoteCreate(BaseModel):
    session_date: str
    attendees: list[str]
    notes: str
    action_items: list[str] = []

class SessionNoteUpdate(BaseModel):
    session_date: Optional[str] = None
    attendees: Optional[list[str]] = None
    notes: Optional[str] = None
    action_items: Optional[list[str]] = None

class SessionNote(BaseModel):
    id: str
    org_id: str
    session_date: str
    attendees: list[str]
    notes: str
    action_items: list[str]
    created_at: str
    updated_at: str

class PlaybookItem(BaseModel):
    id: str
    stage: Stage
    title: str
    description: str
    content: str
    links: list[str] = []

class TechnicalPosture(BaseModel):
    open_risks_by_severity: dict[str, int]
    total_decisions: int
    decisions_by_stage: dict[str, int]
    decisions_by_status: dict[str, int]
    dependency_concentration: list[dict]
    recent_decisions: list[Decision]
    critical_risks: list[Risk]

class ExportData(BaseModel):
    organization: Organization
    decisions: list[Decision]
    risks: list[Risk]
    session_notes: list[SessionNote]
    technical_posture: TechnicalPosture
    exported_at: str

class UserDB(BaseModel):
    id: str
    email: str
    password_hash: str
    name: str
    company_name: str
    org_id: str
    created_at: str

users_db: dict[str, UserDB] = {}
organizations_db: dict[str, Organization] = {}
decisions_db: dict[str, Decision] = {}
risks_db: dict[str, Risk] = {}
session_notes_db: dict[str, SessionNote] = {}

PLAYBOOKS: list[PlaybookItem] = [
    PlaybookItem(id="idea-1", stage=Stage.IDEA, title="Validating Your Technical Idea", description="Before writing any code, validate that your idea solves a real problem", content="Focus on problem validation before solution building. Talk to 20+ potential customers.", links=[]),
    PlaybookItem(id="idea-2", stage=Stage.IDEA, title="Choosing Your Tech Stack", description="How to select technologies without over-engineering", content="Choose boring technology. Pick what your team knows. Avoid shiny new frameworks.", links=[]),
    PlaybookItem(id="mvp-1", stage=Stage.MVP, title="MVP Scope Definition", description="Define the minimum viable product - emphasis on minimum", content="Your MVP should test one core hypothesis. If you can't describe it in one sentence, it's too complex.", links=[]),
    PlaybookItem(id="mvp-2", stage=Stage.MVP, title="Vendor Selection", description="How to evaluate and select development agencies", content="Get 3+ proposals. Check references. Start with a small paid trial project.", links=[]),
    PlaybookItem(id="first-customers-1", stage=Stage.FIRST_CUSTOMERS, title="Scaling Considerations", description="When and how to think about scaling", content="Don't optimize prematurely. Monitor your metrics. Scale when you have evidence of need.", links=[]),
    PlaybookItem(id="due-diligence-1", stage=Stage.DUE_DILIGENCE, title="Preparing for Technical Due Diligence", description="What investors and acquirers look for", content="Document your architecture. Clean up technical debt. Prepare a risk register.", links=[]),
]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserDB:
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = users_db.get(user_id)
    if user is None:
        raise credentials_exception
    return user

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    for user in users_db.values():
        if user.email == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    org_id = str(uuid4())
    org = Organization(id=org_id, name=user_data.company_name, created_at=datetime.utcnow().isoformat())
    organizations_db[org_id] = org
    user_id = str(uuid4())
    user = UserDB(id=user_id, email=user_data.email, password_hash=get_password_hash(user_data.password), name=user_data.name, company_name=user_data.company_name, org_id=org_id, created_at=datetime.utcnow().isoformat())
    users_db[user_id] = user
    access_token = create_access_token(data={"sub": user_id})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse(id=user.id, email=user.email, name=user.name, company_name=user.company_name, org_id=user.org_id, created_at=user.created_at))

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = None
    for u in users_db.values():
        if u.email == form_data.username:
            user = u
            break
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse(id=user.id, email=user.email, name=user.name, company_name=user.company_name, org_id=user.org_id, created_at=user.created_at))

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: UserDB = Depends(get_current_user)):
    return UserResponse(id=current_user.id, email=current_user.email, name=current_user.name, company_name=current_user.company_name, org_id=current_user.org_id, created_at=current_user.created_at)

@app.post("/api/decisions", response_model=Decision)
async def create_decision(decision_data: DecisionCreate, current_user: UserDB = Depends(get_current_user)):
    decision_id = str(uuid4())
    now = datetime.utcnow().isoformat()
    options = [DecisionOption(id=str(uuid4()), **opt.model_dump()) for opt in decision_data.options]
    decision = Decision(id=decision_id, org_id=current_user.org_id, title=decision_data.title, stage=decision_data.stage, status=DecisionStatus.PROPOSED, context=decision_data.context, options=options, recommendation=decision_data.recommendation, accepted_tradeoffs=decision_data.accepted_tradeoffs, deferred_risks=decision_data.deferred_risks, created_by=current_user.id, accepted_by=None, accepted_at=None, created_at=now, updated_at=now)
    decisions_db[decision_id] = decision
    return decision

@app.get("/api/decisions", response_model=list[Decision])
async def get_decisions(stage: Optional[Stage] = None, status: Optional[DecisionStatus] = None, current_user: UserDB = Depends(get_current_user)):
    decisions = [d for d in decisions_db.values() if d.org_id == current_user.org_id]
    if stage:
        decisions = [d for d in decisions if d.stage == stage]
    if status:
        decisions = [d for d in decisions if d.status == status]
    return sorted(decisions, key=lambda x: x.created_at, reverse=True)

@app.get("/api/decisions/{decision_id}", response_model=Decision)
async def get_decision(decision_id: str, current_user: UserDB = Depends(get_current_user)):
    decision = decisions_db.get(decision_id)
    if not decision or decision.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision

@app.put("/api/decisions/{decision_id}", response_model=Decision)
async def update_decision(decision_id: str, decision_data: DecisionUpdate, current_user: UserDB = Depends(get_current_user)):
    decision = decisions_db.get(decision_id)
    if not decision or decision.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Decision not found")
    update_data = decision_data.model_dump(exclude_unset=True)
    if "options" in update_data and update_data["options"] is not None:
        update_data["options"] = [DecisionOption(id=str(uuid4()), **opt) if isinstance(opt, dict) else opt for opt in update_data["options"]]
    if "status" in update_data and update_data["status"] == DecisionStatus.ACCEPTED:
        update_data["accepted_by"] = current_user.id
        update_data["accepted_at"] = datetime.utcnow().isoformat()
    updated_decision = decision.model_copy(update={**update_data, "updated_at": datetime.utcnow().isoformat()})
    decisions_db[decision_id] = updated_decision
    return updated_decision

@app.delete("/api/decisions/{decision_id}")
async def delete_decision(decision_id: str, current_user: UserDB = Depends(get_current_user)):
    decision = decisions_db.get(decision_id)
    if not decision or decision.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Decision not found")
    del decisions_db[decision_id]
    return {"message": "Decision deleted"}

@app.post("/api/risks", response_model=Risk)
async def create_risk(risk_data: RiskCreate, current_user: UserDB = Depends(get_current_user)):
    risk_id = str(uuid4())
    now = datetime.utcnow().isoformat()
    risk = Risk(id=risk_id, org_id=current_user.org_id, title=risk_data.title, description=risk_data.description, severity=risk_data.severity, likelihood=risk_data.likelihood, status=RiskStatus.OPEN, mitigation=risk_data.mitigation, linked_decision_id=risk_data.linked_decision_id, dependency_type=risk_data.dependency_type, dependency_name=risk_data.dependency_name, created_at=now, updated_at=now)
    risks_db[risk_id] = risk
    return risk

@app.get("/api/risks", response_model=list[Risk])
async def get_risks(status: Optional[RiskStatus] = None, severity: Optional[RiskSeverity] = None, current_user: UserDB = Depends(get_current_user)):
    risks = [r for r in risks_db.values() if r.org_id == current_user.org_id]
    if status:
        risks = [r for r in risks if r.status == status]
    if severity:
        risks = [r for r in risks if r.severity == severity]
    return sorted(risks, key=lambda x: x.created_at, reverse=True)

@app.get("/api/risks/{risk_id}", response_model=Risk)
async def get_risk(risk_id: str, current_user: UserDB = Depends(get_current_user)):
    risk = risks_db.get(risk_id)
    if not risk or risk.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk

@app.put("/api/risks/{risk_id}", response_model=Risk)
async def update_risk(risk_id: str, risk_data: RiskUpdate, current_user: UserDB = Depends(get_current_user)):
    risk = risks_db.get(risk_id)
    if not risk or risk.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Risk not found")
    update_data = risk_data.model_dump(exclude_unset=True)
    updated_risk = risk.model_copy(update={**update_data, "updated_at": datetime.utcnow().isoformat()})
    risks_db[risk_id] = updated_risk
    return updated_risk

@app.delete("/api/risks/{risk_id}")
async def delete_risk(risk_id: str, current_user: UserDB = Depends(get_current_user)):
    risk = risks_db.get(risk_id)
    if not risk or risk.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Risk not found")
    del risks_db[risk_id]
    return {"message": "Risk deleted"}

@app.post("/api/session-notes", response_model=SessionNote)
async def create_session_note(note_data: SessionNoteCreate, current_user: UserDB = Depends(get_current_user)):
    note_id = str(uuid4())
    now = datetime.utcnow().isoformat()
    note = SessionNote(id=note_id, org_id=current_user.org_id, session_date=note_data.session_date, attendees=note_data.attendees, notes=note_data.notes, action_items=note_data.action_items, created_at=now, updated_at=now)
    session_notes_db[note_id] = note
    return note

@app.get("/api/session-notes", response_model=list[SessionNote])
async def get_session_notes(current_user: UserDB = Depends(get_current_user)):
    notes = [n for n in session_notes_db.values() if n.org_id == current_user.org_id]
    return sorted(notes, key=lambda x: x.session_date, reverse=True)

@app.get("/api/session-notes/{note_id}", response_model=SessionNote)
async def get_session_note(note_id: str, current_user: UserDB = Depends(get_current_user)):
    note = session_notes_db.get(note_id)
    if not note or note.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Session note not found")
    return note

@app.put("/api/session-notes/{note_id}", response_model=SessionNote)
async def update_session_note(note_id: str, note_data: SessionNoteUpdate, current_user: UserDB = Depends(get_current_user)):
    note = session_notes_db.get(note_id)
    if not note or note.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Session note not found")
    update_data = note_data.model_dump(exclude_unset=True)
    updated_note = note.model_copy(update={**update_data, "updated_at": datetime.utcnow().isoformat()})
    session_notes_db[note_id] = updated_note
    return updated_note

@app.delete("/api/session-notes/{note_id}")
async def delete_session_note(note_id: str, current_user: UserDB = Depends(get_current_user)):
    note = session_notes_db.get(note_id)
    if not note or note.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Session note not found")
    del session_notes_db[note_id]
    return {"message": "Session note deleted"}

@app.get("/api/playbooks", response_model=list[PlaybookItem])
async def get_playbooks(stage: Optional[Stage] = None):
    if stage:
        return [p for p in PLAYBOOKS if p.stage == stage]
    return PLAYBOOKS

@app.get("/api/playbooks/{playbook_id}", response_model=PlaybookItem)
async def get_playbook(playbook_id: str):
    for playbook in PLAYBOOKS:
        if playbook.id == playbook_id:
            return playbook
    raise HTTPException(status_code=404, detail="Playbook not found")

@app.get("/api/posture", response_model=TechnicalPosture)
async def get_technical_posture(current_user: UserDB = Depends(get_current_user)):
    org_decisions = [d for d in decisions_db.values() if d.org_id == current_user.org_id]
    org_risks = [r for r in risks_db.values() if r.org_id == current_user.org_id]
    open_risks = [r for r in org_risks if r.status == RiskStatus.OPEN]
    risks_by_severity = {s.value: len([r for r in open_risks if r.severity == s]) for s in RiskSeverity}
    decisions_by_stage = {s.value: len([d for d in org_decisions if d.stage == s]) for s in Stage}
    decisions_by_status = {s.value: len([d for d in org_decisions if d.status == s]) for s in DecisionStatus}
    dependency_map: dict[str, dict] = {}
    for risk in org_risks:
        if risk.dependency_type and risk.dependency_name:
            key = f"{risk.dependency_type}:{risk.dependency_name}"
            if key not in dependency_map:
                dependency_map[key] = {"type": risk.dependency_type, "name": risk.dependency_name, "count": 0}
            dependency_map[key]["count"] += 1
    dependency_concentration = sorted(dependency_map.values(), key=lambda x: x["count"], reverse=True)[:10]
    recent_decisions = sorted(org_decisions, key=lambda x: x.created_at, reverse=True)[:5]
    critical_risks = [r for r in open_risks if r.severity in [RiskSeverity.HIGH, RiskSeverity.CRITICAL]]
    return TechnicalPosture(open_risks_by_severity=risks_by_severity, total_decisions=len(org_decisions), decisions_by_stage=decisions_by_stage, decisions_by_status=decisions_by_status, dependency_concentration=dependency_concentration, recent_decisions=recent_decisions, critical_risks=critical_risks)

@app.get("/api/export")
async def export_data(format: str = "json", current_user: UserDB = Depends(get_current_user)):
    org = organizations_db.get(current_user.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_decisions = [d for d in decisions_db.values() if d.org_id == current_user.org_id]
    org_risks = [r for r in risks_db.values() if r.org_id == current_user.org_id]
    org_notes = [n for n in session_notes_db.values() if n.org_id == current_user.org_id]
    posture = await get_technical_posture(current_user)
    export = ExportData(organization=org, decisions=sorted(org_decisions, key=lambda x: x.created_at, reverse=True), risks=sorted(org_risks, key=lambda x: x.created_at, reverse=True), session_notes=sorted(org_notes, key=lambda x: x.session_date, reverse=True), technical_posture=posture, exported_at=datetime.utcnow().isoformat())
    if format == "markdown":
        md = f"# CTO Decision Record - {org.name}\n\nExported: {export.exported_at}\n\n## Technical Posture Summary\n\n- Total Decisions: {posture.total_decisions}\n- Open Risks: {sum(posture.open_risks_by_severity.values())}\n  - Critical: {posture.open_risks_by_severity.get('critical', 0)}\n  - High: {posture.open_risks_by_severity.get('high', 0)}\n  - Medium: {posture.open_risks_by_severity.get('medium', 0)}\n  - Low: {posture.open_risks_by_severity.get('low', 0)}\n\n## Key Decisions\n\n"
        for d in export.decisions:
            md += f"### {d.title}\n- Stage: {d.stage.value}\n- Status: {d.status.value}\n- Context: {d.context}\n"
            if d.recommendation:
                md += f"- Recommendation: {d.recommendation}\n"
            if d.accepted_tradeoffs:
                md += f"- Accepted Tradeoffs: {d.accepted_tradeoffs}\n"
            if d.deferred_risks:
                md += f"- Deferred Risks: {d.deferred_risks}\n"
            md += "\n"
        md += "## Known Risks\n\n"
        for r in export.risks:
            md += f"### {r.title}\n- Severity: {r.severity.value}\n- Status: {r.status.value}\n- Description: {r.description}\n"
            if r.mitigation:
                md += f"- Mitigation: {r.mitigation}\n"
            md += "\n"
        return JSONResponse(content={"markdown": md}, media_type="application/json")
    return export.model_dump()
