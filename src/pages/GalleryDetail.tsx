import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-wedding.jpg";

interface Photo {
  id: string;
  image_url: string;
  title: string | null;
}

interface Gallery {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const GalleryDetail = () => {
  const { slug } = useParams();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data: galleryData } = await supabase
        .from("galleries")
        .select("*")
        .eq("slug", slug)
        .single();

      if (galleryData) {
        setGallery(galleryData);

        const { data: photosData } = await supabase
          .from("photos")
          .select("*")
          .eq("gallery_id", galleryData.id)
          .order("display_order", { ascending: true });

        if (photosData) {
          setPhotos(photosData);
        }
      }
      setLoading(false);
    };

    if (slug) {
      fetchGallery();
    }
  }, [slug]);

  // Default photos if none in database
  const defaultPhotos = [
    { id: "1", image_url: heroImage, title: "Fotografija 1" },
    { id: "2", image_url: heroImage, title: "Fotografija 2" },
    { id: "3", image_url: heroImage, title: "Fotografija 3" },
    { id: "4", image_url: heroImage, title: "Fotografija 4" },
    { id: "5", image_url: heroImage, title: "Fotografija 5" },
    { id: "6", image_url: heroImage, title: "Fotografija 6" },
  ];

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;
  const galleryName = gallery?.name || slug?.charAt(0).toUpperCase() + slug?.slice(1);

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="container">
          {/* Back Button */}
          <Link
            to="/gallery"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nazad na galeriju
          </Link>

          {/* Gallery Header */}
          <div className="text-center mb-12">
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">
              Galerija
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              {galleryName}
            </h1>
            <div className="w-16 h-px bg-primary mx-auto" />
            {gallery?.description && (
              <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
                {gallery.description}
              </p>
            )}
          </div>

          {/* Photo Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {displayPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="image-hover rounded-sm overflow-hidden shadow-soft opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-square">
                    <img
                      src={photo.image_url}
                      alt={photo.title || "Wedding photo"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 lightbox-overlay flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-cream hover:text-white transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedPhoto.image_url}
            alt={selectedPhoto.title || "Wedding photo"}
            className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-elegant animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default GalleryDetail;
