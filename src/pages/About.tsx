import { Camera, Award, Heart, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import heroImage from "@/assets/hero-wedding.jpg";

const stats = [
  { icon: Camera, value: "500+", label: "Vjenčanja" },
  { icon: Users, value: "1000+", label: "Sretnih Parova" },
  { icon: Award, value: "8+", label: "Godina Iskustva" },
  { icon: Heart, value: "100%", label: "Ljubavi" },
];

const About = () => {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden shadow-elegant">
                <img
                  src={heroImage}
                  alt="Ana - Wedding Photographer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-champagne/20 rounded-sm -z-10" />
            </div>
            
            <div>
              <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">
                O Meni
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Zdravo, ja sam Ana
              </h1>
              <div className="w-16 h-px bg-primary mb-6" />
              <p className="text-muted-foreground leading-relaxed mb-6">
                Dobrodošli u moj svijet! Ja sam Ana, strastvena fotografkinja vjenčanja 
                sa više od 8 godina iskustva u bilježenju ljubavnih priča. Fotografija 
                je moja strast i poziv – kroz objektiv vidim svijet na poseban način.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Moj pristup kombinira dokumentarni stil sa umjetničkim portretima, 
                osiguravajući da svaka emocija i svaki detalj budu lijepo sačuvani. 
                Vjerujem da je svako vjenčanje jedinstveno i da vaše fotografije 
                trebaju to odražavati.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Fokusiram se na autentične trenutke, prave emocije i male detalje 
                koji čine vaš dan posebnim. Moj cilj je da stvorim fotografije koje 
                ćete cijeniti generacijama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-background shadow-soft flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-serif text-3xl md:text-4xl text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding">
        <div className="container max-w-3xl">
          <SectionHeading
            subtitle="Moja Filozofija"
            title="Pristup Fotografiji"
          />
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Vjerujem da najbolje fotografije nastaju kada se ljudi osjećaju 
              opušteno i prirodno. Zato se trudim stvoriti ugodnu atmosferu 
              gdje možete biti vi sami, bez pritiska ili neugodnosti.
            </p>
            <p>
              Moj stil je spoj dokumentarnog i umjetničkog pristupa. Volim 
              uhvatiti spontane trenutke – osmijeh, pogled, dodir – ali 
              također stvaram predivne portrete koji će vas ostaviti bez daha.
            </p>
            <p>
              Svako vjenčanje je priča, a ja sam tu da je ispričam kroz 
              svoje fotografije. Od pripreme do zadnjeg plesa, bilježim 
              sve te posebne trenutke koje ćete pamtiti zauvijek.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="section-padding bg-charcoal text-cream">
        <div className="container max-w-3xl text-center">
          <blockquote className="font-serif text-2xl md:text-3xl italic text-cream/90 leading-relaxed">
            "Fotografija nije samo bilježenje trenutka – to je čuvanje emocije, 
            priče i uspomene koja će trajati zauvijek."
          </blockquote>
          <div className="w-16 h-px bg-champagne mx-auto mt-8" />
          <p className="text-champagne mt-6 font-medium">— Ana</p>
        </div>
      </section>
    </div>
  );
};

export default About;
