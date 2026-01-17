import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/ui/section-heading";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Unesite validnu email adresu"),
  phone: z.string().optional(),
  event_date: z.string().optional(),
  message: z.string().min(10, "Poruka mora imati najmanje 10 karaktera"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

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
      toast.error("Greška pri slanju poruke. Pokušajte ponovo.");
    } else {
      toast.success("Poruka je uspješno poslana! Javit ću vam se uskoro.");
      reset();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="container">
          <SectionHeading
            subtitle="Kontakt"
            title="Javite Mi Se"
          />
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Rado bih čula vašu priču! Kontaktirajte me da razgovaramo o vašem 
            posebnom danu i kako ga mogu učiniti nezaboravnim.
          </p>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card rounded-sm p-8 shadow-soft">
              <h3 className="font-serif text-2xl text-foreground mb-6">
                Pošaljite Poruku
              </h3>
              
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
                  {isSubmitting ? (
                    "Šaljem..."
                  ) : (
                    <>
                      Pošalji poruku
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:pt-8">
              <h3 className="font-serif text-2xl text-foreground mb-6">
                Kontakt Informacije
              </h3>
              
              <div className="space-y-6 mb-12">
                <a
                  href="mailto:info@anafotografija.com"
                  className="flex items-start gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Email</p>
                    <p>info@anafotografija.com</p>
                  </div>
                </a>

                <a
                  href="tel:+38761234567"
                  className="flex items-start gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Telefon</p>
                    <p>+387 61 234 567</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Lokacija</p>
                    <p>Sarajevo, Bosna i Hercegovina</p>
                    <p className="text-sm">Dostupna za putovanja širom regije</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-medium text-foreground mb-4">Pratite me</h4>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
