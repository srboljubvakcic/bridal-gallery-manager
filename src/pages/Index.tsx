import { useState, useEffect } from "react";
import { ArrowRight, Star, Mail, Phone, MapPin, Send, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import heroImage from "@/assets/hero-wedding.jpg";

interface Gallery {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
}

interface Package {
  id: string;
  title: string;
  description: string | null;
  price: number;
  features: string[] | null;
  is_popular: boolean | null;
}

interface Testimonial {
  id: string;
  name: string;
  content: string;
  wedding_date: string | null;
  rating: number | null;
}

const contactSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Unesite validnu email adresu"),
  phone: z.string().optional(),
  event_date: z.string().optional(),
  message: z.string().min(10, "Poruka mora imati najmanje 10 karaktera"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Index = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const [galleriesRes, packagesRes, testimonialsRes] = await Promise.all([
        supabase.from("galleries").select("*").eq("is_active", true).order("display_order"),
        supabase.from("packages").select("*").eq("is_active", true).order("display_order"),
        supabase.from("testimonials").select("*").eq("is_active", true).order("display_order"),
      ]);

      if (!galleriesRes.error) setGalleries(galleriesRes.data || []);
      if (!packagesRes.error) setPackages(packagesRes.data || []);
      if (!testimonialsRes.error) setTestimonials(testimonialsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    const { error } = await supabase.from("messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      event_date: data.event_date || null,
      message: data.message,
    });

    if (error) {
      toast.error("Greška pri slanju poruke", {
        description: "Molimo pokušajte ponovo ili nas kontaktirajte direktno putem email-a.",
      });
    } else {
      toast.success("Poruka uspješno poslana! ✨", {
        description: "Hvala vam na poruci! Javit ću vam se u najkraćem mogućem roku.",
      });
      reset();
    }
    setIsSubmitting(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={settings.hero.image || heroImage}
            alt="Wedding photography"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/50 to-charcoal/70" />
        </div>

        <div className="relative container text-center z-10">
          <p className="text-champagne uppercase tracking-[0.4em] text-xs md:text-sm font-medium mb-4 opacity-0 animate-fade-in">
            {settings.hero.subtitle}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {settings.hero.title}
            <span className="block italic text-champagne">{settings.hero.title_accent}</span>
          </h1>
          <p className="text-cream/80 max-w-xl mx-auto mb-8 text-base md:text-lg opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {settings.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Button
              size="lg"
              className="px-8"
              onClick={() => scrollToSection("contact")}
            >
              Rezervišite Termin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="px-8 bg-cream/20 backdrop-blur-sm text-cream border border-cream/50 hover:bg-cream hover:text-charcoal"
              onClick={() => scrollToSection("gallery")}
            >
              {settings.hero.cta_secondary_text}
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1s" }}>
          <div className="w-6 h-10 border-2 border-cream/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-cream/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1">
              <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">
                Dobrodošli
              </p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                {settings.about.title}
              </h2>
              <div className="w-16 h-px bg-primary mb-6" />
              <p className="text-muted-foreground leading-relaxed mb-6">
                {settings.about.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {settings.about.description2}
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="aspect-[4/5] bg-muted rounded-sm overflow-hidden shadow-elegant">
                  <img
                    src={settings.about.image || heroImage}
                    alt={settings.about.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-champagne/20 rounded-sm -z-10" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blush/30 rounded-sm -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section-padding">
        <div className="container">
          <SectionHeading subtitle="Moj rad" title="Galerija" />
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Istražite moje najbolje radove iz svijeta fotografije vjenčanja.
          </p>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-sm" />
              ))}
            </div>
          ) : galleries.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Galerije će uskoro biti dodane.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {galleries.map((gallery, index) => (
                <a
                  key={gallery.id}
                  href={`/gallery/${gallery.slug}`}
                  className="group image-hover rounded-sm overflow-hidden shadow-soft opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={gallery.cover_image || heroImage}
                      alt={gallery.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-charcoal/40 group-hover:bg-charcoal/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-cream">
                      <h3 className="font-serif text-2xl md:text-3xl mb-2">
                        {gallery.name}
                      </h3>
                      <p className="text-cream/80 text-sm uppercase tracking-widest">
                        Pogledaj galeriju
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="section-padding bg-secondary/30">
        <div className="container">
          <SectionHeading subtitle="Investicija" title="Paketi i Cijene" />
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Izaberite paket koji najbolje odgovara vašim potrebama.
          </p>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[500px] rounded-sm" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Paketi će uskoro biti dodani.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`relative bg-card rounded-sm p-8 shadow-soft opacity-0 animate-fade-in transition-transform duration-300 hover:-translate-y-2 ${
                    pkg.is_popular ? "ring-2 ring-primary shadow-elegant" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {pkg.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-4 py-1 text-xs uppercase tracking-wider rounded-full">
                        Najpopularniji
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="font-serif text-2xl text-foreground mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {pkg.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-serif text-4xl text-foreground">
                        €{pkg.price}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={pkg.is_popular ? "default" : "outline"}
                    className="w-full"
                    onClick={() => scrollToSection("contact")}
                  >
                    Rezerviši
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="section-padding bg-charcoal">
          <div className="container">
            <SectionHeading
              subtitle="Iskustva"
              title="Šta kažu parovi"
              className="[&_p]:text-champagne [&_h2]:text-cream"
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-cream rounded-sm p-8 shadow-elegant opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-champagne-dark text-champagne-dark" />
                    ))}
                  </div>
                  <blockquote className="font-serif text-lg italic text-charcoal mb-6 text-center leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="text-center">
                    <p className="text-champagne-dark font-medium">{testimonial.name}</p>
                    {testimonial.wedding_date && (
                      <p className="text-charcoal/60 text-sm">{testimonial.wedding_date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="section-padding bg-secondary/30">
        <div className="container">
          <SectionHeading subtitle="Kontakt" title="Javite Mi Se" />
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Rado bih čula vašu priču! Kontaktirajte me da razgovaramo o vašem posebnom danu.
          </p>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
            <div className="bg-card rounded-sm p-8 shadow-soft">
              <h3 className="font-serif text-2xl text-foreground mb-6">Pošaljite Poruku</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="name">Ime i prezime *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Vaše ime"
                    className="mt-1.5"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="vasa@email.com"
                    className="mt-1.5"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+387 61 234 567"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="event_date">Datum vjenčanja</Label>
                  <Input
                    id="event_date"
                    type="date"
                    {...register("event_date")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Poruka *</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Ispričajte mi o svom posebnom danu..."
                    rows={5}
                    className="mt-1.5 resize-none"
                  />
                  {errors.message && (
                    <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Šaljem..." : (
                    <>
                      Pošalji poruku
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="lg:pt-8">
              <h3 className="font-serif text-2xl text-foreground mb-6">Kontakt Informacije</h3>

              <div className="space-y-6 mb-12">
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="flex items-start gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Email</p>
                    <p>{settings.contact.email}</p>
                  </div>
                </a>

                <a
                  href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                  className="flex items-start gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Telefon</p>
                    <p>{settings.contact.phone}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Lokacija</p>
                    <p>{settings.contact.address}</p>
                    <p className="text-sm">{settings.contact.address_note}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-4">Pratite me</h4>
                <div className="flex gap-4">
                  {settings.contact.instagram && (
                    <a
                      href={settings.contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {settings.contact.facebook && (
                    <a
                      href={settings.contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
