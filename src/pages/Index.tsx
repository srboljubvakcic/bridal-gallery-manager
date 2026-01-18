import { useState, useEffect } from "react";
import { ArrowRight, Star, Mail, Phone, MapPin, Send, Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbox } from "@/components/Lightbox";
import { ScrollAnimation } from "@/components/ScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  phone: z.string().min(6, "Unesite validan broj telefona"),
  event_date: z.string().min(1, "Datum vjenčanja je obavezan"),
  message: z.string().min(10, "Poruka mora imati najmanje 10 karaktera"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Index = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<{ id: string; url: string; title?: string }[]>([]);

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
      toast.error(t.contact.error_title, {
        description: t.contact.error_message,
      });
    } else {
      // Try to send email notification (don't fail if it doesn't work)
      try {
        await supabase.functions.invoke('send-contact-notification', {
          body: {
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            event_date: data.event_date || "",
            message: data.message,
            admin_email: settings.contact.email,
          }
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't show error to user - message was still saved
      }

      toast.success(t.contact.success_title, {
        description: t.contact.success_message,
      });
      reset();
    }
    setIsSubmitting(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const openGalleryLightbox = async (gallery: Gallery) => {
    // Fetch photos for this gallery
    const { data: photos } = await supabase
      .from("photos")
      .select("*")
      .eq("gallery_id", gallery.id)
      .order("display_order");
    
    if (photos && photos.length > 0) {
      setLightboxImages(photos.map(p => ({ id: p.id, url: p.image_url, title: p.title || undefined })));
      setLightboxIndex(0);
      setLightboxOpen(true);
    }
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
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-champagne uppercase tracking-[0.4em] text-xs md:text-sm font-medium mb-4"
          >
            {settings.hero.subtitle}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream mb-6"
          >
            {settings.hero.title}
            <span className="block italic text-champagne">{settings.hero.title_accent}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-cream/80 max-w-xl mx-auto mb-8 text-base md:text-lg"
          >
            {settings.hero.description}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="px-8"
              onClick={() => scrollToSection("kontakt")}
            >
              {t.hero.cta_primary}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="px-8 bg-cream/20 backdrop-blur-sm text-cream border border-cream/50 hover:bg-cream hover:text-charcoal"
              onClick={() => scrollToSection("galerija")}
            >
              {t.hero.cta_secondary}
            </Button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-cream/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-cream/60 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="o-meni" className="section-padding bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollAnimation className="order-2 md:order-1" direction="left">
              <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">
                {t.about.subtitle}
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
            </ScrollAnimation>
            <ScrollAnimation className="order-1 md:order-2" direction="right">
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
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galerija" className="section-padding">
        <div className="container">
          <ScrollAnimation>
            <SectionHeading subtitle={t.gallery.subtitle} title={t.gallery.title} />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Istražite moje najbolje radove iz svijeta fotografije vjenčanja.
            </p>
          </ScrollAnimation>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-sm" />
              ))}
            </div>
          ) : galleries.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {t.gallery.empty}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {galleries.map((gallery, index) => (
                <ScrollAnimation key={gallery.id} delay={index * 0.1}>
                  <button
                    onClick={() => openGalleryLightbox(gallery)}
                    className="group image-hover rounded-sm overflow-hidden shadow-soft w-full text-left"
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
                          {t.gallery.view}
                        </p>
                      </div>
                    </div>
                  </button>
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section id="paketi" className="section-padding bg-secondary/30">
        <div className="container">
          <ScrollAnimation>
            <SectionHeading subtitle={t.packages.subtitle} title={t.packages.title} />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Izaberite paket koji najbolje odgovara vašim potrebama.
            </p>
          </ScrollAnimation>

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
                <ScrollAnimation key={pkg.id} delay={index * 0.1}>
                  <div
                    className={`relative bg-card rounded-sm p-8 shadow-soft transition-transform duration-300 hover:-translate-y-2 h-full ${
                      pkg.is_popular ? "ring-2 ring-primary shadow-elegant" : ""
                    }`}
                  >
                    {pkg.is_popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-1 text-xs uppercase tracking-wider rounded-full">
                          {t.packages.popular}
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
                          {formatPrice(pkg.price)}
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
                      onClick={() => scrollToSection("kontakt")}
                    >
                      {t.packages.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="recenzije" className="section-padding bg-charcoal">
          <div className="container">
            <ScrollAnimation>
              <SectionHeading
                subtitle={t.testimonials.subtitle}
                title={t.testimonials.title}
                className="[&_p]:text-champagne [&_h2]:text-cream"
              />
            </ScrollAnimation>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {testimonials.map((testimonial, index) => (
                <ScrollAnimation key={testimonial.id} delay={index * 0.1}>
                  <div className="bg-cream rounded-sm p-8 shadow-elegant h-full">
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
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="kontakt" className="section-padding bg-secondary/30">
        <div className="container">
          <ScrollAnimation>
            <SectionHeading subtitle={t.contact.subtitle} title={t.contact.title} />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Rado bih čula vašu priču! Kontaktirajte me da razgovaramo o vašem posebnom danu.
            </p>
          </ScrollAnimation>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
            <ScrollAnimation direction="left">
              <div className="bg-card rounded-sm p-8 shadow-soft">
                <h3 className="font-serif text-2xl text-foreground mb-6">{t.contact.send}</h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="name">{t.contact.name} *</Label>
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
                    <Label htmlFor="email">{t.contact.email} *</Label>
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
                    <Label htmlFor="phone">{t.contact.phone} *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="+387 61 234 567"
                      className="mt-1.5"
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="event_date">{t.contact.event_date} *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      {...register("event_date")}
                      className="mt-1.5"
                    />
                    {errors.event_date && (
                      <p className="text-destructive text-sm mt-1">{errors.event_date.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">{t.contact.message} *</Label>
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
                    {isSubmitting ? t.contact.sending : (
                      <>
                        {t.contact.send}
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="right" className="lg:pt-8">
              <h3 className="font-serif text-2xl text-foreground mb-6">{t.contact.info_title}</h3>

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
                    <p className="text-foreground font-medium">{t.contact.address}</p>
                    <p>{settings.contact.address}</p>
                    <p className="text-sm">{settings.contact.address_note}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-4">{t.contact.social}</h4>
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
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default Index;
