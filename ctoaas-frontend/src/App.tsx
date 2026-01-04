import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, Users, Eye, GraduationCap, CheckCircle, XCircle, ArrowRight, Mail, Phone, Clock, Star, Menu, X, Globe, AlertTriangle, Zap,
  LayoutDashboard, FileText, BookOpen, MessageSquare, Download, LogOut, Plus, Trash2, Edit, ChevronDown, ChevronUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface User { id: string; email: string; name: string; company_name: string; org_id: string; created_at: string; }
interface AuthResponse { access_token: string; token_type: string; user: User; }
interface DecisionOption { id: string; name: string; description: string; pros: string[]; cons: string[]; }
interface Decision { id: string; org_id: string; title: string; stage: string; status: string; context: string; options: DecisionOption[]; recommendation: string | null; accepted_tradeoffs: string | null; deferred_risks: string | null; created_by: string; accepted_by: string | null; accepted_at: string | null; created_at: string; updated_at: string; }
interface Risk { id: string; org_id: string; title: string; description: string; severity: string; likelihood: string; status: string; mitigation: string | null; linked_decision_id: string | null; dependency_type: string | null; dependency_name: string | null; created_at: string; updated_at: string; }
interface SessionNote { id: string; org_id: string; session_date: string; attendees: string[]; notes: string; action_items: string[]; created_at: string; updated_at: string; }
interface Playbook { id: string; stage: string; title: string; description: string; content: string; links: string[]; }
interface TechnicalPosture { open_risks_by_severity: Record<string, number>; total_decisions: number; decisions_by_stage: Record<string, number>; decisions_by_status: Record<string, number>; dependency_concentration: { type: string; name: string; count: number }[]; recent_decisions: Decision[]; critical_risks: Risk[]; }

class ApiClient {
  private token: string | null = null;
  setToken(token: string | null) { this.token = token; }
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });
    if (!response.ok) { const error = await response.json().catch(() => ({ detail: 'Request failed' })); throw new Error(error.detail || 'Request failed'); }
    return response.json();
  }
  async register(email: string, password: string, name: string, company_name: string): Promise<AuthResponse> { return this.fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, company_name }) }); }
  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams(); formData.append('username', email); formData.append('password', password);
    const response = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData });
    if (!response.ok) throw new Error('Invalid credentials'); return response.json();
  }
  async getMe(): Promise<User> { return this.fetch('/api/auth/me'); }
  async getDecisions(): Promise<Decision[]> { return this.fetch('/api/decisions'); }
  async createDecision(data: Partial<Decision>): Promise<Decision> { return this.fetch('/api/decisions', { method: 'POST', body: JSON.stringify(data) }); }
  async updateDecision(id: string, data: Partial<Decision>): Promise<Decision> { return this.fetch(`/api/decisions/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteDecision(id: string): Promise<void> { return this.fetch(`/api/decisions/${id}`, { method: 'DELETE' }); }
  async getRisks(): Promise<Risk[]> { return this.fetch('/api/risks'); }
  async createRisk(data: Partial<Risk>): Promise<Risk> { return this.fetch('/api/risks', { method: 'POST', body: JSON.stringify(data) }); }
  async updateRisk(id: string, data: Partial<Risk>): Promise<Risk> { return this.fetch(`/api/risks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteRisk(id: string): Promise<void> { return this.fetch(`/api/risks/${id}`, { method: 'DELETE' }); }
  async getSessionNotes(): Promise<SessionNote[]> { return this.fetch('/api/session-notes'); }
  async createSessionNote(data: Partial<SessionNote>): Promise<SessionNote> { return this.fetch('/api/session-notes', { method: 'POST', body: JSON.stringify(data) }); }
  async updateSessionNote(id: string, data: Partial<SessionNote>): Promise<SessionNote> { return this.fetch(`/api/session-notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteSessionNote(id: string): Promise<void> { return this.fetch(`/api/session-notes/${id}`, { method: 'DELETE' }); }
  async getPlaybooks(): Promise<Playbook[]> { return this.fetch('/api/playbooks'); }
  async getPosture(): Promise<TechnicalPosture> { return this.fetch('/api/posture'); }
  async exportData(format: string = 'json'): Promise<unknown> { return this.fetch(`/api/export?format=${format}`); }
}
const api = new ApiClient();

interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string, name: string, company_name: string) => Promise<void>; logout: () => void; isLoading: boolean; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (token) { api.setToken(token); api.getMe().then(setUser).catch(() => { setToken(null); localStorage.removeItem('token'); }).finally(() => setIsLoading(false)); }
    else { setIsLoading(false); }
  }, [token]);
  const login = async (email: string, password: string) => { const response = await api.login(email, password); localStorage.setItem('token', response.access_token); api.setToken(response.access_token); setToken(response.access_token); setUser(response.user); };
  const register = async (email: string, password: string, name: string, company_name: string) => { const response = await api.register(email, password, name, company_name); localStorage.setItem('token', response.access_token); api.setToken(response.access_token); setToken(response.access_token); setUser(response.user); };
  const logout = () => { localStorage.removeItem('token'); api.setToken(null); setToken(null); setUser(null); };
  return <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>;
}
function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; }

type Language = 'en' | 'ar';
const LanguageContext = createContext<{ lang: Language; setLang: (l: Language) => void; isRTL: boolean }>({ lang: 'en', setLang: () => {}, isRTL: false });
function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'en');
  useEffect(() => { localStorage.setItem('lang', lang); document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.documentElement.lang = lang; }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, isRTL: lang === 'ar' }}>{children}</LanguageContext.Provider>;
}
function useLanguage() { return useContext(LanguageContext); }

const translations = {
  en: {
    nav: { whatIDo: "What I Do", whatIDontDo: "What I Don't Do", pricing: "Pricing", testimonials: "Success Stories", contact: "Contact", bookCall: "Book a 20-min Call", login: "Client Login", dashboard: "Dashboard" },
    hero: { badge: "For Non-Technical Founders", title: "I Help You Avoid", titleHighlight: "Irreversible Tech Mistakes", subtitle: "Fractional CTO for non-technical founders. I protect your decisions, not manage your team.", cta: "Book a Free 20-min Second Opinion", secondaryCta: "See How I Help" },
    painPoints: { title: "Common Founder Fears I Address", subtitle: "These are the real problems that kill startups", items: [{ title: "Vendor Lock-in", desc: "Trapped with the wrong agency" }, { title: "Building Wrong", desc: "Spending months on features nobody wants" }, { title: "Can't Judge Devs", desc: "No way to evaluate developers" }, { title: "Wasted Capital", desc: "Burning runway on wrong decisions" }] },
    whatIDo: { title: "What You Get", subtitle: "Decision-focused CTO support", pillars: [{ icon: "Target", title: "Product & Tech Direction", description: "Translate your business idea into product scope", features: ["MVP definition", "Tech stack decisions", "Product roadmap", "Build vs buy"] }, { icon: "Users", title: "Vendor & Team Control", description: "Independent review of agencies and proposals", features: ["Review proposals", "Interview developers", "Evaluate architecture", "Prevent over-engineering"] }, { icon: "Eye", title: "Execution Oversight", description: "Weekly check-ins to keep your project on track", features: ["Weekly progress review", "Risk identification", "Course correction", "Go/no-go decisions"] }, { icon: "GraduationCap", title: "Founder Enablement", description: "Explain technical decisions in business language", features: ["Translate tech to business", "Investor tech questions", "Build confidence", "Due diligence readiness"] }] },
    whatIDontDo: { title: "What I Don't Do", subtitle: "I protect your decisions, not manage your team", tagline: "I'm your decision filter, not your dev manager.", items: ["No coding", "No task management", "No daily standups", "No people management", "No project management", "No implementation"] },
    pricing: { title: "Simple, Transparent Pricing", subtitle: "3-month minimum commitment", tiers: [{ name: "Starter", subtitle: "Idea to MVP Direction", price: "$1,500", period: "/month", idealFor: "Ideal for: idea-stage founders", features: ["2 calls per month", "Product & MVP definition", "Tech stack decision", "Vendor review", "Email support"], cta: "Start with Starter" }, { name: "Growth", subtitle: "Active Build Phase", price: "$3,000", period: "/month", idealFor: "Ideal for: MVP to first users", popular: true, features: ["Weekly call", "Dev progress review", "Architecture oversight", "Founder decision support", "Priority support"], cta: "Start with Growth" }, { name: "Scale", subtitle: "Investor-Ready CTO", price: "$5,000", period: "/month", idealFor: "Ideal for: funded startups", features: ["Weekly + on-demand calls", "Team & architecture review", "Investor tech narrative", "Due diligence readiness", "Direct access"], cta: "Start with Scale" }] },
    testimonials: { title: "Typical Outcomes", subtitle: "What founders experience working with me", items: [{ quote: "Helped me avoid a $40K mistake with an agency.", name: "First-time Founder", role: "E-commerce Startup" }, { quote: "Launched in 6 weeks instead of 6 months.", name: "Solo Founder", role: "SaaS Platform" }, { quote: "Gave me confidence answering investor tech questions.", name: "Non-Technical CEO", role: "FinTech Startup" }] },
    contact: { title: "Let's Talk", subtitle: "Book a free 20-minute call.", email: "hello@ctoaas.com", phone: "+1 (555) 123-4567", hours: "Monday - Friday: 9am - 6pm EST", cta: "Book Your Free Call" },
    footer: { rights: "All rights reserved." },
    auth: { login: "Login", register: "Register", email: "Email", password: "Password", name: "Full Name", company: "Company Name", loginTitle: "Welcome Back", loginSubtitle: "Sign in to access your CTO Decision Record", registerTitle: "Get Started", registerSubtitle: "Create your account to start documenting decisions", noAccount: "Don't have an account?", hasAccount: "Already have an account?", signUp: "Sign up", signIn: "Sign in" },
    dashboard: { title: "CTO Decision Record", welcome: "Welcome back", decisions: "Decision Ledger", posture: "Technical Posture", playbooks: "Playbooks", notes: "Session Notes", export: "Export", logout: "Logout", noDecisions: "No decisions recorded yet", noRisks: "No risks identified yet", noNotes: "No session notes yet", addDecision: "Add Decision", addRisk: "Add Risk", addNote: "Add Session Note", stage: "Stage", status: "Status", context: "Context", recommendation: "Recommendation", tradeoffs: "Accepted Tradeoffs", deferredRisks: "Deferred Risks", options: "Options Considered", severity: "Severity", likelihood: "Likelihood", mitigation: "Mitigation", description: "Description", fieldTitle: "Title", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", pending: "Pending", accepted: "Accepted", rejected: "Rejected", deferred: "Deferred", idea: "Idea", mvp: "MVP", growth: "Growth", scale: "Scale", low: "Low", medium: "Medium", high: "High", critical: "Critical", open: "Open", mitigated: "Mitigated", closed: "Closed", rare: "Rare", unlikely: "Unlikely", possible: "Possible", likely: "Likely", certain: "Certain", sessionDate: "Session Date", attendees: "Attendees", actionItems: "Action Items", exportJson: "Export JSON", exportMarkdown: "Export Markdown", exportTitle: "Export Decision Summary", exportDesc: "Download your CTO Decision Record for investor review.", openRisks: "Open Risks", totalDecisions: "Total Decisions", byStage: "By Stage", byStatus: "By Status", dependencies: "Dependency Concentration", recentDecisions: "Recent Decisions", criticalRisks: "Critical Risks", playbookStages: { idea: "Idea Stage", mvp: "MVP Stage", first_customers: "First Customers", due_diligence: "Due Diligence" } }
  },
  ar: {
    nav: { whatIDo: "ماذا أفعل", whatIDontDo: "ما لا أفعله", pricing: "الأسعار", testimonials: "قصص النجاح", contact: "تواصل", bookCall: "احجز مكالمة", login: "دخول العملاء", dashboard: "لوحة التحكم" },
    hero: { badge: "للمؤسسين غير التقنيين", title: "أساعدك على تجنب", titleHighlight: "الأخطاء التقنية القاتلة", subtitle: "CTO جزئي للمؤسسين غير التقنيين. أحمي قراراتك، لا أدير فريقك.", cta: "احجز مكالمة مجانية", secondaryCta: "كيف أساعد" },
    painPoints: { title: "مخاوف المؤسسين", subtitle: "المشاكل الحقيقية التي تقتل الشركات الناشئة", items: [{ title: "الارتباط بمورد", desc: "محاصر مع وكالة خاطئة" }, { title: "بناء الخطأ", desc: "قضاء أشهر على ميزات لا يريدها أحد" }, { title: "تقييم المطورين", desc: "لا طريقة لتقييم المطورين" }, { title: "هدر رأس المال", desc: "حرق الميزانية على قرارات خاطئة" }] },
    whatIDo: { title: "ما تحصل عليه", subtitle: "دعم CTO يركز على القرارات", pillars: [{ icon: "Target", title: "توجيه المنتج والتقنية", description: "ترجمة فكرتك إلى نطاق منتج", features: ["تعريف MVP", "قرارات التقنية", "خارطة المنتج", "البناء مقابل الشراء"] }, { icon: "Users", title: "التحكم بالموردين", description: "مراجعة مستقلة للوكالات", features: ["مراجعة العروض", "مقابلة المطورين", "تقييم الهندسة", "منع الإفراط"] }, { icon: "Eye", title: "الإشراف على التنفيذ", description: "مكالمات أسبوعية", features: ["مراجعة التقدم", "تحديد المخاطر", "تصحيح المسار", "قرارات المضي"] }, { icon: "GraduationCap", title: "تمكين المؤسس", description: "شرح القرارات بلغة الأعمال", features: ["ترجمة التقنية", "أسئلة المستثمرين", "بناء الثقة", "العناية الواجبة"] }] },
    whatIDontDo: { title: "ما لا أفعله", subtitle: "أحمي قراراتك، لا أدير فريقك", tagline: "أنا فلتر قراراتك، لست مدير التطوير.", items: ["لا برمجة", "لا إدارة مهام", "لا اجتماعات يومية", "لا إدارة أشخاص", "لا إدارة مشاريع", "لا تنفيذ"] },
    pricing: { title: "أسعار بسيطة وشفافة", subtitle: "التزام 3 أشهر كحد أدنى", tiers: [{ name: "المبتدئ", subtitle: "من الفكرة إلى MVP", price: "$1,500", period: "/شهر", idealFor: "مثالي لـ: مؤسسي مرحلة الفكرة", features: ["مكالمتان شهرياً", "تعريف المنتج", "قرار التقنية", "مراجعة الموردين", "دعم بالبريد"], cta: "ابدأ مع المبتدئ" }, { name: "النمو", subtitle: "مرحلة البناء", price: "$3,000", period: "/شهر", idealFor: "مثالي لـ: MVP إلى أول المستخدمين", popular: true, features: ["مكالمة أسبوعية", "مراجعة التقدم", "إشراف على الهندسة", "دعم القرارات", "دعم أولوية"], cta: "ابدأ مع النمو" }, { name: "التوسع", subtitle: "CTO جاهز للمستثمرين", price: "$5,000", period: "/شهر", idealFor: "مثالي لـ: الشركات الممولة", features: ["مكالمات أسبوعية + عند الطلب", "مراجعة الفريق", "سردية للمستثمرين", "العناية الواجبة", "وصول مباشر"], cta: "ابدأ مع التوسع" }] },
    testimonials: { title: "نتائج نموذجية", subtitle: "ما يختبره المؤسسون", items: [{ quote: "ساعدني في تجنب خطأ بـ 40 ألف دولار.", name: "مؤسس لأول مرة", role: "شركة تجارة إلكترونية" }, { quote: "أطلقت في 6 أسابيع بدلاً من 6 أشهر.", name: "مؤسس منفرد", role: "منصة SaaS" }, { quote: "أعطاني الثقة للإجابة على أسئلة المستثمرين.", name: "CEO غير تقني", role: "شركة FinTech" }] },
    contact: { title: "لنتحدث", subtitle: "احجز مكالمة مجانية 20 دقيقة.", email: "hello@ctoaas.com", phone: "+1 (555) 123-4567", hours: "الإثنين - الجمعة: 9 صباحاً - 6 مساءً", cta: "احجز مكالمتك المجانية" },
    footer: { rights: "جميع الحقوق محفوظة." },
    auth: { login: "تسجيل الدخول", register: "إنشاء حساب", email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم الكامل", company: "اسم الشركة", loginTitle: "مرحباً بعودتك", loginSubtitle: "سجل دخولك للوصول إلى سجل قرارات CTO", registerTitle: "ابدأ الآن", registerSubtitle: "أنشئ حسابك لبدء توثيق القرارات", noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب بالفعل؟", signUp: "سجل", signIn: "سجل دخول" },
    dashboard: { title: "سجل قرارات CTO", welcome: "مرحباً بعودتك", decisions: "سجل القرارات", posture: "الوضع التقني", playbooks: "أدلة المؤسس", notes: "ملاحظات الجلسات", export: "تصدير", logout: "تسجيل الخروج", noDecisions: "لا توجد قرارات مسجلة بعد", noRisks: "لا توجد مخاطر محددة بعد", noNotes: "لا توجد ملاحظات جلسات بعد", addDecision: "إضافة قرار", addRisk: "إضافة خطر", addNote: "إضافة ملاحظة جلسة", stage: "المرحلة", status: "الحالة", context: "السياق", recommendation: "التوصية", tradeoffs: "المقايضات المقبولة", deferredRisks: "المخاطر المؤجلة", options: "الخيارات المدروسة", severity: "الشدة", likelihood: "الاحتمالية", mitigation: "التخفيف", description: "الوصف", fieldTitle: "العنوان", save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", pending: "معلق", accepted: "مقبول", rejected: "مرفوض", deferred: "مؤجل", idea: "فكرة", mvp: "MVP", growth: "نمو", scale: "توسع", low: "منخفض", medium: "متوسط", high: "عالي", critical: "حرج", open: "مفتوح", mitigated: "مخفف", closed: "مغلق", rare: "نادر", unlikely: "غير محتمل", possible: "ممكن", likely: "محتمل", certain: "مؤكد", sessionDate: "تاريخ الجلسة", attendees: "الحضور", actionItems: "بنود العمل", exportJson: "تصدير JSON", exportMarkdown: "تصدير Markdown", exportTitle: "تصدير ملخص القرارات", exportDesc: "حمّل سجل قرارات CTO لمراجعة المستثمرين.", openRisks: "المخاطر المفتوحة", totalDecisions: "إجمالي القرارات", byStage: "حسب المرحلة", byStatus: "حسب الحالة", dependencies: "تركز التبعيات", recentDecisions: "القرارات الأخيرة", criticalRisks: "المخاطر الحرجة", playbookStages: { idea: "مرحلة الفكرة", mvp: "مرحلة MVP", first_customers: "أول العملاء", due_diligence: "العناية الواجبة" } }
  }
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Target, Users, Eye, GraduationCap };

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LoginPage() {
  const { lang } = useLanguage();
  const t = translations[lang].auth;
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center"><CardTitle className="text-2xl">{t.loginTitle}</CardTitle><CardDescription>{t.loginSubtitle}</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            <div><Label htmlFor="email">{t.email}</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><Label htmlFor="password">{t.password}</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '...' : t.login}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-600">{t.noAccount} <Link to="/register" className="text-zinc-900 font-medium hover:underline">{t.signUp}</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}

function RegisterPage() {
  const { lang } = useLanguage();
  const t = translations[lang].auth;
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(email, password, name, company); navigate('/dashboard'); } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center"><CardTitle className="text-2xl">{t.registerTitle}</CardTitle><CardDescription>{t.registerSubtitle}</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            <div><Label htmlFor="name">{t.name}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div><Label htmlFor="company">{t.company}</Label><Input id="company" value={company} onChange={e => setCompany(e.target.value)} required /></div>
            <div><Label htmlFor="email">{t.email}</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><Label htmlFor="password">{t.password}</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '...' : t.register}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-600">{t.hasAccount} <Link to="/login" className="text-zinc-900 font-medium hover:underline">{t.signIn}</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardLayout({ children }: { children: ReactNode }) {
  const { lang, setLang, isRTL } = useLanguage();
  const t = translations[lang].dashboard;
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t.posture },
    { path: '/dashboard/decisions', icon: FileText, label: t.decisions },
    { path: '/dashboard/playbooks', icon: BookOpen, label: t.playbooks },
    { path: '/dashboard/notes', icon: MessageSquare, label: t.notes },
    { path: '/dashboard/export', icon: Download, label: t.export },
  ];
  return (
    <div className={`min-h-screen bg-zinc-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className="bg-white border-b border-zinc-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold">{t.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{t.welcome}, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}><Globe className="w-4 h-4 mr-1" />{lang === 'en' ? 'AR' : 'EN'}</Button>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}><LogOut className="w-4 h-4 mr-1" />{t.logout}</Button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto flex">
        <nav className="w-64 bg-white border-r border-zinc-200 min-h-screen p-4">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${location.pathname === item.path ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function PosturePage() {
  const { lang } = useLanguage();
  const t = translations[lang].dashboard;
  const [posture, setPosture] = useState<TechnicalPosture | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getPosture().then(setPosture).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;
  if (!posture) return <div className="text-center py-12 text-zinc-500">Failed to load posture</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.posture}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">{t.totalDecisions}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{posture.total_decisions}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">{t.openRisks}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-600">{Object.values(posture.open_risks_by_severity).reduce((a, b) => a + b, 0)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">{t.dependencies}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{posture.dependency_concentration.length}</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>{t.byStage}</CardTitle></CardHeader><CardContent><div className="space-y-2">{Object.entries(posture.decisions_by_stage).map(([stage, count]) => (<div key={stage} className="flex justify-between"><span className="capitalize">{stage}</span><span className="font-medium">{count}</span></div>))}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>{t.byStatus}</CardTitle></CardHeader><CardContent><div className="space-y-2">{Object.entries(posture.decisions_by_status).map(([status, count]) => (<div key={status} className="flex justify-between"><span className="capitalize">{status}</span><span className="font-medium">{count}</span></div>))}</div></CardContent></Card>
      </div>
      {posture.critical_risks.length > 0 && (
        <Card><CardHeader><CardTitle className="text-red-600">{t.criticalRisks}</CardTitle></CardHeader><CardContent><div className="space-y-3">{posture.critical_risks.map(risk => (<div key={risk.id} className="p-3 bg-red-50 rounded-lg"><p className="font-medium">{risk.title}</p><p className="text-sm text-zinc-600">{risk.description}</p></div>))}</div></CardContent></Card>
      )}
    </div>
  );
}

function DecisionsPage() {
  const { lang } = useLanguage();
  const t = translations[lang].dashboard;
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', stage: 'idea', status: 'pending', context: '', recommendation: '', accepted_tradeoffs: '', deferred_risks: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => { loadDecisions(); }, []);
  const loadDecisions = () => { setLoading(true); api.getDecisions().then(setDecisions).finally(() => setLoading(false)); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { await api.updateDecision(editingId, form); } else { await api.createDecision(form); }
    setShowForm(false); setEditingId(null); setForm({ title: '', stage: 'idea', status: 'pending', context: '', recommendation: '', accepted_tradeoffs: '', deferred_risks: '' }); loadDecisions();
  };
  const handleEdit = (d: Decision) => { setForm({ title: d.title, stage: d.stage, status: d.status, context: d.context, recommendation: d.recommendation || '', accepted_tradeoffs: d.accepted_tradeoffs || '', deferred_risks: d.deferred_risks || '' }); setEditingId(d.id); setShowForm(true); };
  const handleDelete = async (id: string) => { await api.deleteDecision(id); loadDecisions(); };
  const statusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', accepted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', deferred: 'bg-zinc-100 text-zinc-800' };
  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">{t.decisions}</h1><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />{t.addDecision}</Button></div>
      {showForm && (
        <Card><CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t.title}</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>{t.stage}</Label><select className="w-full border rounded-md p-2" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}><option value="idea">{t.idea}</option><option value="mvp">{t.mvp}</option><option value="growth">{t.growth}</option><option value="scale">{t.scale}</option></select></div>
            </div>
            <div><Label>{t.status}</Label><select className="w-full border rounded-md p-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="pending">{t.pending}</option><option value="accepted">{t.accepted}</option><option value="rejected">{t.rejected}</option><option value="deferred">{t.deferred}</option></select></div>
            <div><Label>{t.context}</Label><Textarea value={form.context} onChange={e => setForm({ ...form, context: e.target.value })} /></div>
            <div><Label>{t.recommendation}</Label><Textarea value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} /></div>
            <div><Label>{t.tradeoffs}</Label><Textarea value={form.accepted_tradeoffs} onChange={e => setForm({ ...form, accepted_tradeoffs: e.target.value })} /></div>
            <div><Label>{t.deferredRisks}</Label><Textarea value={form.deferred_risks} onChange={e => setForm({ ...form, deferred_risks: e.target.value })} /></div>
            <div className="flex gap-2"><Button type="submit">{t.save}</Button><Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>{t.cancel}</Button></div>
          </form>
        </CardContent></Card>
      )}
      {decisions.length === 0 ? <p className="text-center py-12 text-zinc-500">{t.noDecisions}</p> : (
        <div className="space-y-4">{decisions.map(d => (
          <Card key={d.id}>
            <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}>
              <div className="flex justify-between items-start">
                <div><CardTitle className="flex items-center gap-2">{d.title}{expandedId === d.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</CardTitle><CardDescription>{d.stage} stage</CardDescription></div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[d.status]}`}>{d.status}</span>
              </div>
            </CardHeader>
            {expandedId === d.id && (
              <CardContent className="space-y-4">
                {d.context && <div><p className="text-sm font-medium text-zinc-500">{t.context}</p><p>{d.context}</p></div>}
                {d.recommendation && <div><p className="text-sm font-medium text-zinc-500">{t.recommendation}</p><p>{d.recommendation}</p></div>}
                {d.accepted_tradeoffs && <div><p className="text-sm font-medium text-zinc-500">{t.tradeoffs}</p><p>{d.accepted_tradeoffs}</p></div>}
                {d.deferred_risks && <div><p className="text-sm font-medium text-zinc-500">{t.deferredRisks}</p><p>{d.deferred_risks}</p></div>}
                <div className="flex gap-2 pt-4 border-t"><Button size="sm" variant="outline" onClick={() => handleEdit(d)}><Edit className="w-4 h-4 mr-1" />{t.edit}</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(d.id)}><Trash2 className="w-4 h-4 mr-1" />{t.delete}</Button></div>
              </CardContent>
            )}
          </Card>
        ))}</div>
      )}
    </div>
  );
}

function PlaybooksPage() {
  const { lang } = useLanguage();
  const t = translations[lang].dashboard;
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getPlaybooks().then(setPlaybooks).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;
  const stages = ['idea', 'mvp', 'first_customers', 'due_diligence'];
  const stageLabels = t.playbookStages as Record<string, string>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.playbooks}</h1>
      {stages.map(stage => {
        const stagePlaybooks = playbooks.filter(p => p.stage === stage);
        if (stagePlaybooks.length === 0) return null;
        return (
          <div key={stage}>
            <h2 className="text-lg font-semibold mb-3">{stageLabels[stage]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stagePlaybooks.map(p => (
                <Card key={p.id}><CardHeader><CardTitle className="text-base">{p.title}</CardTitle><CardDescription>{p.description}</CardDescription></CardHeader><CardContent><p className="text-sm text-zinc-600">{p.content}</p></CardContent></Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NotesPage() {
  const { lang } = useLanguage();
  const t = translations[lang].dashboard;
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ session_date: new Date().toISOString().split('T')[0], attendees: '', notes: '', action_items: '' });
  useEffect(() => { loadNotes(); }, []);
  const loadNotes = () => { setLoading(true); api.getSessionNotes().then(setNotes).finally(() => setLoading(false)); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSessionNote({ session_date: form.session_date, attendees: form.attendees.split(',').map(s => s.trim()), notes: form.notes, action_items: form.action_items.split('\n').filter(s => s.trim()) });
    setShowForm(false); setForm({ session_date: new Date().toISOString().split('T')[0], attendees: '', notes: '', action_items: '' }); loadNotes();
  };
  const handleDelete = async (id: string) => { await api.deleteSessionNote(id); loadNotes(); };
  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">{t.notes}</h1><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />{t.addNote}</Button></div>
      {showForm && (
        <Card><CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>{t.sessionDate}</Label><Input type="date" value={form.session_date} onChange={e => setForm({ ...form, session_date: e.target.value })} required /></div>
            <div><Label>{t.attendees} (comma-separated)</Label><Input value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} placeholder="John, Jane, Bob" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4} /></div>
            <div><Label>{t.actionItems} (one per line)</Label><Textarea value={form.action_items} onChange={e => setForm({ ...form, action_items: e.target.value })} rows={3} /></div>
            <div className="flex gap-2"><Button type="submit">{t.save}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button></div>
          </form>
        </CardContent></Card>
      )}
      {notes.length === 0 ? <p className="text-center py-12 text-zinc-500">{t.noNotes}</p> : (
        <div className="space-y-4">{notes.map(n => (
          <Card key={n.id}>
            <CardHeader><CardTitle>{new Date(n.session_date).toLocaleDateString()}</CardTitle><CardDescription>{n.attendees.join(', ')}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <p>{n.notes}</p>
              {n.action_items.length > 0 && (<div><p className="text-sm font-medium text-zinc-500 mb-1">{t.actionItems}</p><ul className="list-disc list-inside text-sm">{n.action_items.map((item, i) => <li key={i}>{item}</li>)}</ul></div>)}
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(n.id)}><Trash2 className="w-4 h-4 mr-1" />{t.delete}</Button>
            </CardContent>
          </Card>
        ))}</div>
      )}
    </div>
  );
}

function ExportPage() {
  const { lang } = useLanguage();
  const t = translations[lang].dashboard;
  const [loading, setLoading] = useState(false);
  const handleExport = async (format: string) => {
    setLoading(true);
    try {
      const data = await api.exportData(format);
      const content = format === 'json' ? JSON.stringify(data, null, 2) : (data as { markdown: string }).markdown;
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `cto-decision-record.${format === 'json' ? 'json' : 'md'}`; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.exportTitle}</h1>
      <p className="text-zinc-600">{t.exportDesc}</p>
      <div className="flex gap-4">
        <Button onClick={() => handleExport('json')} disabled={loading}><Download className="w-4 h-4 mr-2" />{t.exportJson}</Button>
        <Button onClick={() => handleExport('markdown')} disabled={loading} variant="outline"><Download className="w-4 h-4 mr-2" />{t.exportMarkdown}</Button>
      </div>
    </div>
  );
}

function LandingPage() {
  const { lang, setLang, isRTL } = useLanguage();
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollToSection = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };
  const calendlyUrl = 'https://calendly.com/ctoaas/20min';
  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-zinc-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold">CTOaaS</span>
            </div>
            <nav className={`hidden md:flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => scrollToSection('what-i-do')} className="text-zinc-600 hover:text-zinc-900">{t.nav.whatIDo}</button>
              <button onClick={() => scrollToSection('what-i-dont-do')} className="text-zinc-600 hover:text-zinc-900">{t.nav.whatIDontDo}</button>
              <button onClick={() => scrollToSection('pricing')} className="text-zinc-600 hover:text-zinc-900">{t.nav.pricing}</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-zinc-600 hover:text-zinc-900">{t.nav.testimonials}</button>
              <Link to="/login" className="text-zinc-600 hover:text-zinc-900">{t.nav.login}</Link>
              <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}><Globe className="w-4 h-4 mr-1" />{lang === 'en' ? 'AR' : 'EN'}</Button>
              <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"><Button>{t.nav.bookCall}</Button></a>
            </nav>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-zinc-100 py-4 px-4">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('what-i-do')} className="text-zinc-600">{t.nav.whatIDo}</button>
              <button onClick={() => scrollToSection('pricing')} className="text-zinc-600">{t.nav.pricing}</button>
              <Link to="/login" className="text-zinc-600">{t.nav.login}</Link>
              <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}><Globe className="w-4 h-4 mr-1" />{lang === 'en' ? 'AR' : 'EN'}</Button>
              <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"><Button className="w-full">{t.nav.bookCall}</Button></a>
            </div>
          </div>
        )}
      </header>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-2 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium mb-6">{t.hero.badge}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6">{t.hero.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-900">{t.hero.titleHighlight}</span></h1>
          <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">{t.hero.subtitle}</p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"><Button size="lg" className="text-lg px-8">{t.hero.cta}<ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} /></Button></a>
            <Button size="lg" variant="outline" onClick={() => scrollToSection('what-i-do')}>{t.hero.secondaryCta}</Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t.painPoints.title}</h2>
          <p className="text-zinc-600 text-center mb-12">{t.painPoints.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.painPoints.items.map((item, i) => (
              <Card key={i} className="border-red-100 bg-red-50/50">
                <CardHeader><AlertTriangle className="w-8 h-8 text-red-500 mb-2" /><CardTitle className="text-lg">{item.title}</CardTitle></CardHeader>
                <CardContent><p className="text-zinc-600">{item.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="what-i-do" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t.whatIDo.title}</h2>
          <p className="text-zinc-600 text-center mb-12">{t.whatIDo.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.whatIDo.pillars.map((pillar, i) => {
              const Icon = iconMap[pillar.icon] || Target;
              return (
                <Card key={i}>
                  <CardHeader><Icon className="w-10 h-10 text-zinc-900 mb-2" /><CardTitle>{pillar.title}</CardTitle><CardDescription>{pillar.description}</CardDescription></CardHeader>
                  <CardContent><ul className="space-y-2">{pillar.features.map((f, j) => (<li key={j} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /><span>{f}</span></li>))}</ul></CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="what-i-dont-do" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t.whatIDontDo.title}</h2>
          <p className="text-zinc-400 mb-4">{t.whatIDontDo.subtitle}</p>
          <p className="text-xl italic text-zinc-300 mb-12">{t.whatIDontDo.tagline}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t.whatIDontDo.items.map((item, i) => (
              <div key={i} className={`flex items-center gap-2 text-zinc-400 ${isRTL ? 'flex-row-reverse' : ''}`}><XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /><span>{item}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t.pricing.title}</h2>
          <p className="text-zinc-600 text-center mb-12">{t.pricing.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.pricing.tiers.map((tier, i) => (
              <Card key={i} className={tier.popular ? 'border-zinc-900 border-2 relative' : ''}>
                {tier.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-3 py-1 rounded-full text-sm">Popular</span>}
                <CardHeader><CardTitle>{tier.name}</CardTitle><CardDescription>{tier.subtitle}</CardDescription><div className="mt-4"><span className="text-4xl font-bold">{tier.price}</span><span className="text-zinc-500">{tier.period}</span></div><p className="text-sm text-zinc-500 mt-2">{tier.idealFor}</p></CardHeader>
                <CardContent><ul className="space-y-3 mb-6">{tier.features.map((f, j) => (<li key={j} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /><span>{f}</span></li>))}</ul><a href={calendlyUrl} target="_blank" rel="noopener noreferrer"><Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>{tier.cta}</Button></a></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t.testimonials.title}</h2>
          <p className="text-zinc-600 text-center mb-12">{t.testimonials.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.testimonials.items.map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-zinc-700 mb-4 italic">"{item.quote}"</p>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-zinc-500">{item.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t.contact.title}</h2>
          <p className="text-zinc-600 mb-8">{t.contact.subtitle}</p>
          <div className={`flex flex-col md:flex-row justify-center gap-8 mb-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><Mail className="w-5 h-5 text-zinc-500" /><span>{t.contact.email}</span></div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><Phone className="w-5 h-5 text-zinc-500" /><span>{t.contact.phone}</span></div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><Clock className="w-5 h-5 text-zinc-500" /><span>{t.contact.hours}</span></div>
          </div>
          <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"><Button size="lg">{t.contact.cta}<ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} /></Button></a>
        </div>
      </section>

      <footer className="bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-zinc-900" /></div>
              <span className="text-xl font-bold text-white">CTOaaS</span>
            </div>
            <div className={`flex gap-8 text-zinc-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => scrollToSection('what-i-do')} className="hover:text-white">{t.nav.whatIDo}</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-white">{t.nav.pricing}</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-white">{t.nav.contact}</button>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500"><p>&copy; {new Date().getFullYear()} CTOaaS. {t.footer.rights}</p></div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><PosturePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/decisions" element={<ProtectedRoute><DashboardLayout><DecisionsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/playbooks" element={<ProtectedRoute><DashboardLayout><PlaybooksPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/notes" element={<ProtectedRoute><DashboardLayout><NotesPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/export" element={<ProtectedRoute><DashboardLayout><ExportPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
