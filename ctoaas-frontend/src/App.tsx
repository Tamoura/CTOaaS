import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Map, 
  Search, 
  Users, 
  Building, 
  Shield, 
  Zap, 
  Rocket,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Clock,
  Star,
  Menu,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  price_range: string;
  duration: string;
  icon: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Map,
  Search,
  Users,
  Building,
  Shield,
  Zap,
  Rocket,
};

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    service_id: '',
    company_size: '',
    message: '',
    preferred_date: '',
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [consultationSubmitted, setConsultationSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error('Error fetching services:', err));
  }, []);

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationForm),
      });
      if (response.ok) {
        setConsultationSubmitted(true);
        setConsultationForm({
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          service_id: '',
          company_size: '',
          message: '',
          preferred_date: '',
        });
      }
    } catch (err) {
      console.error('Error submitting consultation:', err);
    }
    setLoading(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (response.ok) {
        setContactSubmitted(true);
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error('Error submitting contact:', err);
    }
    setLoading(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-zinc-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900">CTOaaS</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('services')} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Testimonials
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Contact
              </button>
              <Button onClick={() => scrollToSection('book')}>
                Book Consultation
              </Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-zinc-200 py-4">
            <div className="flex flex-col gap-4 px-4">
              <button onClick={() => scrollToSection('services')} className="text-left text-zinc-600 hover:text-zinc-900">
                Services
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left text-zinc-600 hover:text-zinc-900">
                How It Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-left text-zinc-600 hover:text-zinc-900">
                Testimonials
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-left text-zinc-600 hover:text-zinc-900">
                Contact
              </button>
              <Button onClick={() => scrollToSection('book')} className="w-full">
                Book Consultation
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-zinc-100 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-zinc-600">Trusted by 200+ companies worldwide</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 leading-tight">
              Fractional CTO Services for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-900">
                Growing Businesses
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
              Get expert technology leadership without the full-time commitment. 
              Strategic guidance, technical expertise, and hands-on support when you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => scrollToSection('book')} className="gap-2">
                Schedule a Free Consultation
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('services')}>
                Explore Services
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-zinc-200">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-zinc-900">200+</div>
              <div className="text-zinc-600 mt-1">Companies Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-zinc-900">15+</div>
              <div className="text-zinc-600 mt-1">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-zinc-900">$50M+</div>
              <div className="text-zinc-600 mt-1">Funding Raised</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-zinc-900">98%</div>
              <div className="text-zinc-600 mt-1">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Our Services</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Comprehensive technology leadership services tailored to your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = iconMap[service.icon] || Zap;
              return (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedService === service.id ? 'ring-2 ring-zinc-900' : ''
                  }`}
                  onClick={() => setSelectedService(selectedService === service.id ? '' : service.id)}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-zinc-900" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="text-zinc-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Duration</span>
                        <span className="font-medium text-zinc-900">{service.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Investment</span>
                        <span className="font-medium text-zinc-900">{service.price_range}</span>
                      </div>
                      
                      {selectedService === service.id && (
                        <div className="pt-4 border-t border-zinc-200">
                          <p className="text-sm font-medium text-zinc-900 mb-2">What's Included:</p>
                          <ul className="space-y-2">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-zinc-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full mt-4" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConsultationForm({ ...consultationForm, service_id: service.id });
                              scrollToSection('book');
                            }}
                          >
                            Book This Service
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">How It Works</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              A simple, streamlined process to get you the technology leadership you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Discovery Call</h3>
              <p className="text-zinc-600">
                We start with a free consultation to understand your business, challenges, and goals. 
                This helps us tailor our approach to your specific needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Custom Proposal</h3>
              <p className="text-zinc-600">
                Based on our discussion, we create a detailed proposal outlining the scope, 
                timeline, deliverables, and investment for your engagement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Execution & Support</h3>
              <p className="text-zinc-600">
                We dive in and deliver results. You get hands-on support, regular updates, 
                and actionable recommendations throughout the engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from the companies we've helped
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-zinc-50 border-0">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-zinc-600 mb-6">
                  "Working with CTOaaS transformed our technical strategy. They helped us 
                  scale from a small startup to a Series B company with a robust architecture."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-zinc-900">Sarah Chen</div>
                    <div className="text-sm text-zinc-500">CEO, TechFlow</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-50 border-0">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-zinc-600 mb-6">
                  "The technical due diligence they provided was invaluable during our acquisition. 
                  Their insights helped us negotiate a better deal and avoid potential pitfalls."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-zinc-900">Michael Rodriguez</div>
                    <div className="text-sm text-zinc-500">Partner, Venture Capital</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-50 border-0">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-zinc-600 mb-6">
                  "They helped us build an engineering team from scratch. The hiring process 
                  they designed has been instrumental in attracting top talent."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-zinc-900">Emily Watson</div>
                    <div className="text-sm text-zinc-500">Founder, DataSync</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Book Consultation Section */}
      <section id="book" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Book a Consultation</h2>
            <p className="text-lg text-zinc-400">
              Ready to take your technology to the next level? Let's talk.
            </p>
          </div>

          {consultationSubmitted ? (
            <Card className="bg-white">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Thank You!</h3>
                <p className="text-zinc-600">
                  We've received your consultation request. Our team will reach out within 24 hours 
                  to schedule your free discovery call.
                </p>
                <Button 
                  className="mt-6" 
                  onClick={() => setConsultationSubmitted(false)}
                >
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white">
              <CardContent className="pt-6">
                <form onSubmit={handleConsultationSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        required
                        value={consultationForm.company_name}
                        onChange={(e) => setConsultationForm({ ...consultationForm, company_name: e.target.value })}
                        placeholder="Your company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Your Name *</Label>
                      <Input
                        id="contact_name"
                        required
                        value={consultationForm.contact_name}
                        onChange={(e) => setConsultationForm({ ...consultationForm, contact_name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={consultationForm.email}
                        onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={consultationForm.phone}
                        onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Service of Interest *</Label>
                      <Select
                        value={consultationForm.service_id}
                        onValueChange={(value) => setConsultationForm({ ...consultationForm, service_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_size">Company Size *</Label>
                      <Select
                        value={consultationForm.company_size}
                        onValueChange={(value) => setConsultationForm({ ...consultationForm, company_size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_date">Preferred Date (Optional)</Label>
                    <Input
                      id="preferred_date"
                      type="date"
                      value={consultationForm.preferred_date}
                      onChange={(e) => setConsultationForm({ ...consultationForm, preferred_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Tell us about your needs *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={4}
                      value={consultationForm.message}
                      onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                      placeholder="Describe your current challenges and what you're hoping to achieve..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Submitting...' : 'Request Free Consultation'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Get in Touch</h2>
              <p className="text-lg text-zinc-600 mb-8">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-zinc-900" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900">Email</h3>
                    <p className="text-zinc-600">hello@ctoaas.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-zinc-900" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900">Phone</h3>
                    <p className="text-zinc-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-zinc-900" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900">Office Hours</h3>
                    <p className="text-zinc-600">Monday - Friday: 9am - 6pm EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {contactSubmitted ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">Message Sent!</h3>
                    <p className="text-zinc-600">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button 
                      className="mt-6" 
                      onClick={() => setContactSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_name_form">Name *</Label>
                        <Input
                          id="contact_name_form"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email *</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          required
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          placeholder="How can we help?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_message">Message *</Label>
                        <Textarea
                          id="contact_message"
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="Your message..."
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-zinc-900" />
              </div>
              <span className="text-xl font-bold text-white">CTOaaS</span>
            </div>
            <div className="flex gap-8 text-zinc-400">
              <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">
                Contact
              </button>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500">
            <p>&copy; {new Date().getFullYear()} CTOaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App
