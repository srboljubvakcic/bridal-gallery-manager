import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Package {
  id: string;
  title: string;
  description: string | null;
  price: number;
  features: string[] | null;
  is_popular: boolean | null;
}

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data) {
        setPackages(data);
      }
      setLoading(false);
    };

    fetchPackages();
  }, []);

  // Default packages if none in database
  const defaultPackages: Package[] = [
    {
      id: "1",
      title: "Osnovni",
      description: "Savršen za mala, intimna vjenčanja",
      price: 800,
      features: [
        "4 sata fotografisanja",
        "150+ obrađenih fotografija",
        "Online galerija",
        "Digitalni download",
      ],
      is_popular: false,
    },
    {
      id: "2",
      title: "Premium",
      description: "Najpopularniji izbor za cjelodnevno pokriće",
      price: 1500,
      features: [
        "8 sati fotografisanja",
        "400+ obrađenih fotografija",
        "Engagement sesija uključena",
        "Online galerija",
        "USB sa svim fotografijama",
        "20x30 print u poklon",
      ],
      is_popular: true,
    },
    {
      id: "3",
      title: "Luksuzni",
      description: "Kompletno iskustvo za nezaboravne uspomene",
      price: 2500,
      features: [
        "Cijeli dan fotografisanja",
        "700+ obrađenih fotografija",
        "Engagement sesija",
        "Drugi fotograf uključen",
        "Luksuzni foto album",
        "Online galerija",
        "Svi printovi uključeni",
        "Prioritetna obrada",
      ],
      is_popular: false,
    },
  ];

  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="container">
          <SectionHeading
            subtitle="Investicija"
            title="Paketi i Cijene"
          />
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Izaberite paket koji najbolje odgovara vašim potrebama. 
            Svaki paket može se prilagoditi vašim željama.
          </p>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[500px] rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {displayPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={cn(
                    "relative bg-card rounded-sm p-8 shadow-soft opacity-0 animate-fade-in transition-transform duration-300 hover:-translate-y-2",
                    pkg.is_popular && "ring-2 ring-primary shadow-elegant"
                  )}
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
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={pkg.is_popular ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link to="/contact">
                      Rezerviši
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Custom Package Note */}
          <div className="text-center mt-16 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              Trebate nešto prilagođeno? Kontaktirajte me za personaliziranu ponudu 
              koja savršeno odgovara vašim potrebama i budžetu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
