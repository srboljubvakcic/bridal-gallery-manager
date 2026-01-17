import { Link } from "react-router-dom";
import { ArrowRight, Heart, Camera, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import heroImage from "@/assets/hero-wedding.jpg";

const features = [
  {
    icon: Heart,
    title: "Autentični Trenuci",
    description: "Bilježim prave emocije i spontane trenutke koji čine vaš dan posebnim.",
  },
  {
    icon: Camera,
    title: "Profesionalna Oprema",
    description: "Koristim najnoviju profesionalnu opremu za fotografije najviše kvalitete.",
  },
  {
    icon: Sparkles,
    title: "Umjetnički Pristup",
    description: "Spajam dokumentarni stil s umjetničkim portretima za jedinstvene fotografije.",
  },
];

const Index = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Wedding photography"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        
        <div className="relative container text-center z-10">
          <p className="text-primary uppercase tracking-[0.4em] text-xs md:text-sm font-medium mb-4 opacity-0 animate-fade-in">
            Fotografija Vjenčanja
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Čuvam Vašu
            <span className="block italic text-primary">Vječnost</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-base md:text-lg opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Čuvam najljepše trenutke vašeg posebnog dana s umjetničkom elegancijom i bezvremenskom gracioznošću.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Button asChild size="lg" className="px-8">
              <Link to="/contact">
                Kontaktirajte me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/gallery">Pogledaj galeriju</Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1s" }}>
          <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-primary/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1">
              <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">
                Dobrodošli
              </p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                Zdravo, ja sam Ana
              </h2>
              <div className="w-16 h-px bg-primary mb-6" />
              <p className="text-muted-foreground leading-relaxed mb-6">
                Već više od 8 godina s ljubavlju bilježim priče o ljubavi. Moj pristup 
                kombinuje dokumentarni stil s umjetničkim portretima, osiguravajući da 
                svaka emocija i detalj budu lijepo sačuvani.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Svako vjenčanje je jedinstveno, i vjerujem da vaše fotografije trebaju 
                to odražavati. Fokusiram se na autentične trenutke, prave emocije i 
                male detalje koji čine vaš dan posebnim.
              </p>
              <Button asChild variant="outline">
                <Link to="/about">
                  Više o meni
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="aspect-[4/5] bg-muted rounded-sm overflow-hidden shadow-elegant">
                  <img
                    src={heroImage}
                    alt="Ana - Wedding Photographer"
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

      {/* Features Section */}
      <section className="section-padding">
        <div className="container">
          <SectionHeading
            subtitle="Zašto izabrati mene"
            title="Moj Pristup"
          />
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Preview */}
      <section className="section-padding bg-charcoal text-cream">
        <div className="container max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-champagne text-champagne" />
            ))}
          </div>
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl italic text-cream/90 mb-8 leading-relaxed">
            "Ana je učinila naš poseban dan zaista nezaboravnim. Njene fotografije 
            su uhvatile svaku emociju i svaki detalj savršeno."
          </blockquote>
          <div>
            <p className="text-champagne font-medium">Marija & Petar</p>
            <p className="text-cream/60 text-sm">Vjenčanje u Sarajevu, 2024</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container text-center max-w-2xl">
          <SectionHeading
            subtitle="Spremni ste?"
            title="Započnimo Vašu Priču"
          />
          <p className="text-muted-foreground mb-8">
            Vaša ljubavna priča zaslužuje da bude ispričana. Kontaktirajte me da 
            razgovaramo o vašem posebnom danu i kako ga mogu učiniti nezaboravnim.
          </p>
          <Button asChild size="lg" className="px-10">
            <Link to="/contact">
              Rezervirajte Termin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
