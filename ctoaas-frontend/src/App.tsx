import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Users, 
  Eye, 
  GraduationCap,
  CheckCircle,
  XCircle,
  ArrowRight,
  Mail,
  Phone,
  Clock,
  Star,
  Menu,
  X,
  Globe,
  Shield,
  AlertTriangle,
  Zap
} from 'lucide-react';

const translations = {
  en: {
    nav: {
      whatIDo: 'What I Do',
      whatIDontDo: "What I Don't Do",
      pricing: 'Pricing',
      testimonials: 'Success Stories',
      contact: 'Contact',
      bookCall: 'Book a 20-min Call',
    },
    hero: {
      badge: 'For Non-Technical Founders',
      title: 'I Help You Avoid',
      titleHighlight: 'Irreversible Tech Mistakes',
      subtitle: 'Fractional CTO for non-technical founders. I protect your decisions, not manage your team. Strategic guidance to ship your MVP without burning capital or wasting 6-12 months.',
      cta: 'Book a Free 20-min Second Opinion',
      secondaryCta: 'See How I Help',
    },
    painPoints: {
      title: 'Common Founder Fears I Address',
      subtitle: 'These are the real problems that kill startups - not lack of funding',
      items: [
        { title: 'Vendor Lock-in', desc: 'Trapped with the wrong agency or tech stack' },
        { title: 'Building Wrong', desc: 'Spending months on features nobody wants' },
        { title: "Can't Judge Devs", desc: 'No way to evaluate if developers are good' },
        { title: 'Wasted Capital', desc: 'Burning runway on wrong technical decisions' },
      ],
    },
    whatIDo: {
      title: 'What You Get',
      subtitle: 'Decision-focused CTO support, not hands-on execution',
      pillars: [
        {
          icon: 'Target',
          title: 'Product & Tech Direction',
          description: 'Translate your business idea into a clear product scope',
          features: [
            'MVP definition (and what NOT to build)',
            'Tech stack decisions (language, cloud, tools)',
            'Product roadmap prioritization',
            'Build vs. buy recommendations',
          ],
        },
        {
          icon: 'Users',
          title: 'Vendor & Team Control',
          description: 'Independent review of agencies, developers, and proposals',
          features: [
            'Review dev agency proposals',
            'Interview developers on your behalf',
            'Evaluate architecture decisions',
            'Prevent over-engineering',
          ],
        },
        {
          icon: 'Eye',
          title: 'Execution Oversight',
          description: 'Weekly check-ins to keep your project on track',
          features: [
            'Weekly progress review',
            'Risk identification & mitigation',
            'Course correction recommendations',
            'Go/no-go decision support',
          ],
        },
        {
          icon: 'GraduationCap',
          title: 'Founder Enablement',
          description: 'Explain technical decisions in business language',
          features: [
            'Translate tech to business terms',
            'Prepare for investor tech questions',
            'Build your technical confidence',
            'Due diligence readiness',
          ],
        },
      ],
    },
    whatIDontDo: {
      title: "What I Don't Do",
      subtitle: 'I protect your decisions, not manage your team',
      tagline: '"I\'m your decision filter, not your dev manager."',
      items: [
        'No coding or development work',
        'No task management or Jira tickets',
        'No daily standups or scrums',
        'No people management',
        'No project management',
        'No hands-on implementation',
      ],
    },
    pricing: {
      title: 'Simple, Transparent Pricing',
      subtitle: '3-month minimum commitment. Cancel anytime after.',
      tiers: [
        {
          name: 'Starter',
          subtitle: 'Idea to MVP Direction',
          price: '$1,500',
          period: '/month',
          idealFor: 'Ideal for: idea-stage founders',
          features: [
            '2 calls per month',
            'Product & MVP definition',
            'Tech stack decision',
            'Vendor review',
            'Email support',
          ],
          cta: 'Start with Starter',
        },
        {
          name: 'Growth',
          subtitle: 'Active Build Phase',
          price: '$3,000',
          period: '/month',
          idealFor: 'Ideal for: MVP to first users',
          popular: true,
          features: [
            'Weekly call',
            'Dev progress review',
            'Architecture & risk oversight',
            'Founder decision support',
            'Priority email & chat support',
          ],
          cta: 'Start with Growth',
        },
        {
          name: 'Scale',
          subtitle: 'Investor-Ready CTO',
          price: '$5,000',
          period: '/month',
          idealFor: 'Ideal for: funded startups',
          features: [
            'Weekly + on-demand calls',
            'Team & architecture review',
            'Investor tech narrative',
            'Due diligence readiness',
            'Direct access (Slack/WhatsApp)',
          ],
          cta: 'Start with Scale',
        },
      ],
    },
    testimonials: {
      title: 'Typical Outcomes',
      subtitle: 'What founders experience working with me',
      items: [
        {
          quote: 'Helped me interview an agency and avoid a $40K mistake. The red flags he spotted saved my entire runway.',
          name: 'First-time Founder',
          role: 'E-commerce Startup',
        },
        {
          quote: 'I stopped overbuilding and launched in 6 weeks instead of 6 months. He kept asking "do you really need this for v1?"',
          name: 'Solo Founder',
          role: 'SaaS Platform',
        },
        {
          quote: 'Gave me confidence answering investor tech questions. I closed my seed round knowing exactly what to say.',
          name: 'Non-Technical CEO',
          role: 'FinTech Startup',
        },
      ],
    },
    contact: {
      title: "Let's Talk",
      subtitle: 'Book a free 20-minute call. No pitch, just a second opinion on your tech situation.',
      email: 'hello@ctoaas.com',
      phone: '+1 (555) 123-4567',
      hours: 'Monday - Friday: 9am - 6pm EST',
      cta: 'Book Your Free Call',
    },
    footer: {
      rights: 'All rights reserved.',
    },
  },
  ar: {
    nav: {
      whatIDo: 'ماذا أفعل',
      whatIDontDo: 'ما لا أفعله',
      pricing: 'الأسعار',
      testimonials: 'قصص النجاح',
      contact: 'تواصل',
      bookCall: 'احجز مكالمة 20 دقيقة',
    },
    hero: {
      badge: 'للمؤسسين غير التقنيين',
      title: 'أساعدك على تجنب',
      titleHighlight: 'الأخطاء التقنية القاتلة',
      subtitle: 'CTO جزئي للمؤسسين غير التقنيين. أحمي قراراتك، لا أدير فريقك. إرشاد استراتيجي لإطلاق MVP دون حرق رأس المال أو إضاعة 6-12 شهراً.',
      cta: 'احجز مكالمة مجانية 20 دقيقة',
      secondaryCta: 'كيف أساعد',
    },
    painPoints: {
      title: 'مخاوف المؤسسين التي أعالجها',
      subtitle: 'هذه المشاكل الحقيقية التي تقتل الشركات الناشئة - وليس نقص التمويل',
      items: [
        { title: 'الارتباط بمورد', desc: 'محاصر مع وكالة أو تقنية خاطئة' },
        { title: 'بناء الخطأ', desc: 'قضاء أشهر على ميزات لا يريدها أحد' },
        { title: 'تقييم المطورين', desc: 'لا طريقة لمعرفة إذا كان المطورون جيدين' },
        { title: 'هدر رأس المال', desc: 'حرق الميزانية على قرارات تقنية خاطئة' },
      ],
    },
    whatIDo: {
      title: 'ما تحصل عليه',
      subtitle: 'دعم CTO يركز على القرارات، لا التنفيذ',
      pillars: [
        {
          icon: 'Target',
          title: 'توجيه المنتج والتقنية',
          description: 'ترجمة فكرتك التجارية إلى نطاق منتج واضح',
          features: [
            'تعريف MVP (وما لا يجب بناؤه)',
            'قرارات التقنية (اللغة، السحابة، الأدوات)',
            'ترتيب أولويات خارطة المنتج',
            'توصيات البناء مقابل الشراء',
          ],
        },
        {
          icon: 'Users',
          title: 'التحكم بالموردين والفريق',
          description: 'مراجعة مستقلة للوكالات والمطورين والعروض',
          features: [
            'مراجعة عروض وكالات التطوير',
            'مقابلة المطورين نيابة عنك',
            'تقييم قرارات الهندسة',
            'منع الإفراط في الهندسة',
          ],
        },
        {
          icon: 'Eye',
          title: 'الإشراف على التنفيذ',
          description: 'مكالمات أسبوعية لإبقاء مشروعك على المسار',
          features: [
            'مراجعة التقدم الأسبوعي',
            'تحديد المخاطر والتخفيف منها',
            'توصيات تصحيح المسار',
            'دعم قرارات المضي/التوقف',
          ],
        },
        {
          icon: 'GraduationCap',
          title: 'تمكين المؤسس',
          description: 'شرح القرارات التقنية بلغة الأعمال',
          features: [
            'ترجمة التقنية لمصطلحات الأعمال',
            'التحضير لأسئلة المستثمرين التقنية',
            'بناء ثقتك التقنية',
            'الجاهزية للعناية الواجبة',
          ],
        },
      ],
    },
    whatIDontDo: {
      title: 'ما لا أفعله',
      subtitle: 'أحمي قراراتك، لا أدير فريقك',
      tagline: '"أنا فلتر قراراتك، لست مدير التطوير."',
      items: [
        'لا برمجة أو تطوير',
        'لا إدارة مهام أو تذاكر Jira',
        'لا اجتماعات يومية أو سكرم',
        'لا إدارة أشخاص',
        'لا إدارة مشاريع',
        'لا تنفيذ عملي',
      ],
    },
    pricing: {
      title: 'أسعار بسيطة وشفافة',
      subtitle: 'التزام 3 أشهر كحد أدنى. إلغاء في أي وقت بعدها.',
      tiers: [
        {
          name: 'المبتدئ',
          subtitle: 'من الفكرة إلى توجيه MVP',
          price: '$1,500',
          period: '/شهر',
          idealFor: 'مثالي لـ: مؤسسي مرحلة الفكرة',
          features: [
            'مكالمتان شهرياً',
            'تعريف المنتج و MVP',
            'قرار التقنية',
            'مراجعة الموردين',
            'دعم بالبريد الإلكتروني',
          ],
          cta: 'ابدأ مع المبتدئ',
        },
        {
          name: 'النمو',
          subtitle: 'مرحلة البناء النشط',
          price: '$3,000',
          period: '/شهر',
          idealFor: 'مثالي لـ: MVP إلى أول المستخدمين',
          popular: true,
          features: [
            'مكالمة أسبوعية',
            'مراجعة تقدم التطوير',
            'إشراف على الهندسة والمخاطر',
            'دعم قرارات المؤسس',
            'دعم أولوية بالبريد والدردشة',
          ],
          cta: 'ابدأ مع النمو',
        },
        {
          name: 'التوسع',
          subtitle: 'CTO جاهز للمستثمرين',
          price: '$5,000',
          period: '/شهر',
          idealFor: 'مثالي لـ: الشركات الممولة',
          features: [
            'مكالمات أسبوعية + عند الطلب',
            'مراجعة الفريق والهندسة',
            'سردية تقنية للمستثمرين',
            'جاهزية العناية الواجبة',
            'وصول مباشر (Slack/WhatsApp)',
          ],
          cta: 'ابدأ مع التوسع',
        },
      ],
    },
    testimonials: {
      title: 'نتائج نموذجية',
      subtitle: 'ما يختبره المؤسسون عند العمل معي',
      items: [
        {
          quote: 'ساعدني في مقابلة وكالة وتجنب خطأ بـ 40 ألف دولار. العلامات الحمراء التي رصدها أنقذت ميزانيتي بالكامل.',
          name: 'مؤسس لأول مرة',
          role: 'شركة تجارة إلكترونية',
        },
        {
          quote: 'توقفت عن البناء الزائد وأطلقت في 6 أسابيع بدلاً من 6 أشهر. كان يسأل دائماً "هل تحتاج هذا فعلاً للنسخة الأولى؟"',
          name: 'مؤسس منفرد',
          role: 'منصة SaaS',
        },
        {
          quote: 'أعطاني الثقة للإجابة على أسئلة المستثمرين التقنية. أغلقت جولة البذور وأنا أعرف بالضبط ماذا أقول.',
          name: 'CEO غير تقني',
          role: 'شركة FinTech',
        },
      ],
    },
    contact: {
      title: 'لنتحدث',
      subtitle: 'احجز مكالمة مجانية 20 دقيقة. لا عرض بيع، فقط رأي ثانٍ على وضعك التقني.',
      email: 'hello@ctoaas.com',
      phone: '+1 (555) 123-4567',
      hours: 'الإثنين - الجمعة: 9 صباحاً - 6 مساءً بتوقيت EST',
      cta: 'احجز مكالمتك المجانية',
    },
    footer: {
      rights: 'جميع الحقوق محفوظة.',
    },
  },
};

type Language = 'en' | 'ar';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Users,
  Eye,
  GraduationCap,
};

const CALENDLY_URL = 'https://calendly.com/ctoaas/20min';

function App() {
  const [lang, setLang] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const openCalendly = () => {
    window.open(CALENDLY_URL, '_blank');
  };

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-zinc-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900">CTOaaS</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('what-i-do')} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm">
                {t.nav.whatIDo}
              </button>
              <button onClick={() => scrollToSection('what-i-dont-do')} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm">
                {t.nav.whatIDontDo}
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm">
                {t.nav.pricing}
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm">
                {t.nav.testimonials}
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm">
                {t.nav.contact}
              </button>
              
              <button 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 transition-colors text-sm border border-zinc-300 rounded-md px-2 py-1"
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'العربية' : 'English'}
              </button>
              
              <Button onClick={openCalendly} size="sm">
                {t.nav.bookCall}
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="p-2 text-zinc-600"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button 
                className="p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-zinc-200 py-4">
            <div className="flex flex-col gap-4 px-4">
              <button onClick={() => scrollToSection('what-i-do')} className={`${isRTL ? 'text-right' : 'text-left'} text-zinc-600 hover:text-zinc-900`}>
                {t.nav.whatIDo}
              </button>
              <button onClick={() => scrollToSection('what-i-dont-do')} className={`${isRTL ? 'text-right' : 'text-left'} text-zinc-600 hover:text-zinc-900`}>
                {t.nav.whatIDontDo}
              </button>
              <button onClick={() => scrollToSection('pricing')} className={`${isRTL ? 'text-right' : 'text-left'} text-zinc-600 hover:text-zinc-900`}>
                {t.nav.pricing}
              </button>
              <button onClick={() => scrollToSection('testimonials')} className={`${isRTL ? 'text-right' : 'text-left'} text-zinc-600 hover:text-zinc-900`}>
                {t.nav.testimonials}
              </button>
              <button onClick={() => scrollToSection('contact')} className={`${isRTL ? 'text-right' : 'text-left'} text-zinc-600 hover:text-zinc-900`}>
                {t.nav.contact}
              </button>
              <Button onClick={openCalendly} className="w-full">
                {t.nav.bookCall}
              </Button>
            </div>
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className={`${isRTL ? 'text-right' : 'text-center'} max-w-4xl ${isRTL ? '' : 'mx-auto'}`}>
            <div className="inline-flex items-center gap-2 bg-zinc-900 text-white rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{t.hero.badge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 leading-tight">
              {t.hero.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                {t.hero.titleHighlight}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''} justify-center`}>
              <Button size="lg" onClick={openCalendly} className="gap-2 bg-zinc-900 hover:bg-zinc-800">
                {t.hero.cta}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('what-i-do')}>
                {t.hero.secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className="max-w-7xl mx-auto">
          <div className={`${isRTL ? 'text-right' : 'text-center'} mb-12`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{t.painPoints.title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t.painPoints.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.painPoints.items.map((item, index) => (
              <Card key={index} className="bg-white border-red-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="what-i-do" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`${isRTL ? 'text-right' : 'text-center'} mb-16`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{t.whatIDo.title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t.whatIDo.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.whatIDo.pillars.map((pillar, index) => {
              const IconComponent = iconMap[pillar.icon] || Target;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-zinc-900" />
                    </div>
                    <CardTitle className="text-xl">{pillar.title}</CardTitle>
                    <CardDescription className="text-zinc-600">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pillar.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-zinc-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="what-i-dont-do" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className={`${isRTL ? 'text-right' : 'text-center'} mb-12`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{t.whatIDontDo.title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-4">
              {t.whatIDontDo.subtitle}
            </p>
            <p className="text-xl font-medium text-zinc-800 italic">
              {t.whatIDontDo.tagline}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {t.whatIDontDo.items.map((item, index) => (
                    <div key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-zinc-600">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`${isRTL ? 'text-right' : 'text-center'} mb-16`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{t.pricing.title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t.pricing.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.pricing.tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${tier.popular ? 'ring-2 ring-zinc-900 shadow-lg' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-zinc-900 text-white text-sm font-medium px-4 py-1 rounded-full">
                      {lang === 'en' ? 'Most Popular' : 'الأكثر شعبية'}
                    </span>
                  </div>
                )}
                <CardHeader className={`${isRTL ? 'text-right' : 'text-center'} pb-2`}>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.subtitle}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-zinc-900">{tier.price}</span>
                    <span className="text-zinc-600">{tier.period}</span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-2">{tier.idealFor}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={openCalendly}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className={`${isRTL ? 'text-right' : 'text-center'} mb-16`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{t.testimonials.title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t.testimonials.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.testimonials.items.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className={`text-zinc-600 mb-6 ${isRTL ? 'text-right' : ''}`}>
                    "{testimonial.quote}"
                  </p>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center">
                      <span className="text-zinc-600 font-medium">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <div className="font-medium text-zinc-900">{testimonial.name}</div>
                      <div className="text-sm text-zinc-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className={`${isRTL ? 'text-right' : 'text-center'} mb-12`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{t.contact.title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t.contact.subtitle}
            </p>
          </div>

          <Card className="bg-zinc-900 text-white">
            <CardContent className="pt-8 pb-8">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{lang === 'en' ? 'Email' : 'البريد الإلكتروني'}</h3>
                    <p className="text-zinc-400">{t.contact.email}</p>
                  </div>
                </div>
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{lang === 'en' ? 'Phone' : 'الهاتف'}</h3>
                    <p className="text-zinc-400">{t.contact.phone}</p>
                  </div>
                </div>
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{lang === 'en' ? 'Hours' : 'ساعات العمل'}</h3>
                    <p className="text-zinc-400">{t.contact.hours}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={openCalendly}
                  className="bg-white text-zinc-900 hover:bg-zinc-100 gap-2"
                >
                  {t.contact.cta}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-zinc-900" />
              </div>
              <span className="text-xl font-bold text-white">CTOaaS</span>
            </div>
            <div className={`flex gap-8 text-zinc-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => scrollToSection('what-i-do')} className="hover:text-white transition-colors">
                {t.nav.whatIDo}
              </button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">
                {t.nav.pricing}
              </button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">
                {t.nav.contact}
              </button>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500">
            <p>&copy; {new Date().getFullYear()} CTOaaS. {t.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
