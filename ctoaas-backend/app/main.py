from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import uuid4

app = FastAPI(
    title="CTOaaS API",
    description="CTO as a Service - Fractional CTO services for growing businesses",
    version="1.0.0"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Pydantic Models
class Service(BaseModel):
    id: str
    name: str
    description: str
    features: list[str]
    price_range: str
    duration: str
    icon: str

class ConsultationRequest(BaseModel):
    company_name: str
    contact_name: str
    email: str
    phone: Optional[str] = None
    service_id: str
    company_size: str
    message: str
    preferred_date: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: str
    company_name: str
    contact_name: str
    email: str
    phone: Optional[str]
    service_id: str
    company_size: str
    message: str
    preferred_date: Optional[str]
    status: str
    created_at: str

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    subject: str
    message: str
    created_at: str

# In-memory database
SERVICES: list[Service] = [
    Service(
        id="tech-strategy",
        name="Technology Strategy & Roadmap",
        description="Develop a comprehensive technology strategy aligned with your business goals. We'll create a detailed roadmap for your tech initiatives.",
        features=[
            "Technology assessment and audit",
            "Strategic roadmap development",
            "Budget planning and optimization",
            "Vendor evaluation and selection",
            "Risk assessment and mitigation"
        ],
        price_range="$5,000 - $15,000",
        duration="2-4 weeks",
        icon="Map"
    ),
    Service(
        id="tech-due-diligence",
        name="Technical Due Diligence",
        description="Comprehensive technical assessment for M&A, investments, or partnerships. Get detailed insights into technology assets and risks.",
        features=[
            "Code quality assessment",
            "Architecture review",
            "Team capability evaluation",
            "Technical debt analysis",
            "Scalability assessment"
        ],
        price_range="$10,000 - $25,000",
        duration="1-3 weeks",
        icon="Search"
    ),
    Service(
        id="team-building",
        name="Team Building & Hiring",
        description="Build and scale your engineering team effectively. From hiring strategies to team structure optimization.",
        features=[
            "Hiring strategy development",
            "Interview process design",
            "Team structure optimization",
            "Onboarding program creation",
            "Performance framework setup"
        ],
        price_range="$3,000 - $10,000",
        duration="2-6 weeks",
        icon="Users"
    ),
    Service(
        id="architecture-review",
        name="Architecture Review",
        description="Expert review of your system architecture to identify improvements, bottlenecks, and optimization opportunities.",
        features=[
            "System architecture analysis",
            "Performance optimization",
            "Scalability recommendations",
            "Security assessment",
            "Cloud infrastructure review"
        ],
        price_range="$5,000 - $12,000",
        duration="1-2 weeks",
        icon="Building"
    ),
    Service(
        id="security-assessment",
        name="Security Assessment",
        description="Comprehensive security review to identify vulnerabilities and implement best practices for protecting your systems.",
        features=[
            "Security audit and assessment",
            "Compliance review (SOC2, GDPR, etc.)",
            "Penetration testing coordination",
            "Security policy development",
            "Incident response planning"
        ],
        price_range="$8,000 - $20,000",
        duration="2-4 weeks",
        icon="Shield"
    ),
    Service(
        id="digital-transformation",
        name="Digital Transformation",
        description="Guide your organization through digital transformation initiatives to modernize operations and improve efficiency.",
        features=[
            "Digital maturity assessment",
            "Transformation roadmap",
            "Process automation strategy",
            "Change management support",
            "Technology adoption planning"
        ],
        price_range="$15,000 - $50,000",
        duration="4-12 weeks",
        icon="Zap"
    ),
    Service(
        id="startup-advisory",
        name="Startup Advisory",
        description="Strategic technology guidance for startups. From MVP development to scaling your tech operations.",
        features=[
            "MVP strategy and planning",
            "Technology stack selection",
            "Investor pitch preparation",
            "Growth strategy development",
            "Fundraising technical support"
        ],
        price_range="$2,000 - $8,000/month",
        duration="Ongoing",
        icon="Rocket"
    )
]

consultations_db: list[ConsultationResponse] = []
contacts_db: list[ContactResponse] = []

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/services", response_model=list[Service])
async def get_services():
    return SERVICES

@app.get("/api/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    for service in SERVICES:
        if service.id == service_id:
            return service
    raise HTTPException(status_code=404, detail="Service not found")

@app.post("/api/consultations", response_model=ConsultationResponse)
async def create_consultation(consultation: ConsultationRequest):
    service_exists = any(s.id == consultation.service_id for s in SERVICES)
    if not service_exists:
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    new_consultation = ConsultationResponse(
        id=str(uuid4()),
        company_name=consultation.company_name,
        contact_name=consultation.contact_name,
        email=consultation.email,
        phone=consultation.phone,
        service_id=consultation.service_id,
        company_size=consultation.company_size,
        message=consultation.message,
        preferred_date=consultation.preferred_date,
        status="pending",
        created_at=datetime.utcnow().isoformat()
    )
    consultations_db.append(new_consultation)
    return new_consultation

@app.get("/api/consultations", response_model=list[ConsultationResponse])
async def get_consultations():
    return consultations_db

@app.post("/api/contact", response_model=ContactResponse)
async def create_contact(contact: ContactRequest):
    new_contact = ContactResponse(
        id=str(uuid4()),
        name=contact.name,
        email=contact.email,
        subject=contact.subject,
        message=contact.message,
        created_at=datetime.utcnow().isoformat()
    )
    contacts_db.append(new_contact)
    return new_contact

@app.get("/api/contacts", response_model=list[ContactResponse])
async def get_contacts():
    return contacts_db
