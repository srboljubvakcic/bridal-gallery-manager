import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/ui/section-heading";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-wedding.jpg";

interface Gallery {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
}

const Gallery = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleries = async () => {
      const { data, error } = await supabase
        .from("galleries")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data) {
        setGalleries(data);
      }
      setLoading(false);
    };

    fetchGalleries();
  }, []);

  // Default galleries if none in database
  const defaultGalleries = [
    {
      id: "1",
      name: "Ceremonija",
      slug: "ceremonija",
      description: "Posebni trenuci iz ceremonije vjenčanja",
      cover_image: heroImage,
    },
    {
      id: "2",
      name: "Parovi",
      slug: "parovi",
      description: "Romantični portreti mladenaca",
      cover_image: heroImage,
    },
    {
      id: "3",
      name: "Detalji",
      slug: "detalji",
      description: "Mali detalji koji čine veliki dan",
      cover_image: heroImage,
    },
    {
      id: "4",
      name: "Zabava",
      slug: "zabava",
      description: "Veselje i slavlje na vjenčanju",
      cover_image: heroImage,
    },
  ];

  const displayGalleries = galleries.length > 0 ? galleries : defaultGalleries;

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="container">
          <SectionHeading
            subtitle="Moj rad"
            title="Galerija"
          />
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
           Pogledajte neke od mojih radova.
          </p>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {displayGalleries.map((gallery, index) => (
                <Link
                  key={gallery.id}
                  to={`/gallery/${gallery.slug}`}
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
