import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const TestimonialForm = () => {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const labels = {
    sr: {
      title: "Ostavite svoju recenziju",
      description: "Podijelite vaše iskustvo sa nama. Vaša recenzija će biti objavljena nakon odobrenja.",
      name: "Vaše ime",
      name_placeholder: "Marija & Petar",
      wedding: "Datum / lokacija vjenčanja",
      wedding_placeholder: "Vjenčanje u Sarajevu, 2024",
      review: "Vaša recenzija",
      review_placeholder: "Ispričajte nam o vašem iskustvu...",
      rating: "Ocjena",
      submit: "Pošaljite recenziju",
      submitting: "Šaljem...",
      success: "Hvala na vašoj recenziji! Bit će objavljena nakon odobrenja.",
      error: "Greška pri slanju recenzije. Pokušajte ponovo.",
      thank_you: "Hvala vam!",
      thank_you_desc: "Vaša recenzija je uspješno poslana i bit će objavljena nakon pregleda.",
    },
    en: {
      title: "Leave a Review",
      description: "Share your experience with us. Your review will be published after approval.",
      name: "Your name",
      name_placeholder: "Maria & Peter",
      wedding: "Wedding date / location",
      wedding_placeholder: "Wedding in Sarajevo, 2024",
      review: "Your review",
      review_placeholder: "Tell us about your experience...",
      rating: "Rating",
      submit: "Submit Review",
      submitting: "Submitting...",
      success: "Thank you for your review! It will be published after approval.",
      error: "Error submitting review. Please try again.",
      thank_you: "Thank you!",
      thank_you_desc: "Your review has been submitted and will be published after review.",
    },
    de: {
      title: "Bewertung hinterlassen",
      description: "Teilen Sie Ihre Erfahrung mit uns. Ihre Bewertung wird nach Genehmigung veröffentlicht.",
      name: "Ihr Name",
      name_placeholder: "Maria & Peter",
      wedding: "Hochzeitsdatum / Ort",
      wedding_placeholder: "Hochzeit in Sarajevo, 2024",
      review: "Ihre Bewertung",
      review_placeholder: "Erzählen Sie uns von Ihrer Erfahrung...",
      rating: "Bewertung",
      submit: "Bewertung absenden",
      submitting: "Wird gesendet...",
      success: "Vielen Dank für Ihre Bewertung! Sie wird nach Genehmigung veröffentlicht.",
      error: "Fehler beim Senden der Bewertung. Bitte versuchen Sie es erneut.",
      thank_you: "Vielen Dank!",
      thank_you_desc: "Ihre Bewertung wurde eingereicht und wird nach Überprüfung veröffentlicht.",
    },
  };

  const t = labels[language] || labels.sr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("testimonials").insert({
      name: name.trim(),
      wedding_date: weddingDate.trim() || null,
      content: content.trim(),
      rating,
      is_active: false,
      display_order: 0,
    });

    if (error) {
      toast.error(t.error);
    } else {
      setIsSubmitted(true);
      toast.success(t.success);
      setName("");
      setWeddingDate("");
      setContent("");
      setRating(5);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-cream/5 backdrop-blur-sm border border-cream/10 rounded-sm p-8 max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-champagne mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-cream mb-2">{t.thank_you}</h3>
            <p className="text-cream/70">{t.thank_you_desc}</p>
            <Button
              variant="outline"
              className="mt-6 border-cream/30 text-cream hover:bg-cream/10"
              onClick={() => setIsSubmitted(false)}
            >
              {t.title}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl text-cream mb-2">{t.title}</h3>
              <p className="text-cream/60 text-sm">{t.description}</p>
            </div>

            <div>
              <Label htmlFor="review-name" className="text-cream/80">{t.name} *</Label>
              <Input
                id="review-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.name_placeholder}
                required
                className="mt-1.5 bg-cream/5 border-cream/20 text-cream placeholder:text-cream/30 focus:border-champagne"
              />
            </div>

            <div>
              <Label htmlFor="review-wedding" className="text-cream/80">{t.wedding}</Label>
              <Input
                id="review-wedding"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                placeholder={t.wedding_placeholder}
                className="mt-1.5 bg-cream/5 border-cream/20 text-cream placeholder:text-cream/30 focus:border-champagne"
              />
            </div>

            <div>
              <Label className="text-cream/80">{t.rating}</Label>
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? "fill-champagne text-champagne"
                          : "text-cream/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="review-content" className="text-cream/80">{t.review} *</Label>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.review_placeholder}
                rows={4}
                required
                className="mt-1.5 bg-cream/5 border-cream/20 text-cream placeholder:text-cream/30 focus:border-champagne resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-champagne/20 text-cream border border-champagne/40 hover:bg-champagne/30"
            >
              {isSubmitting ? t.submitting : (
                <>
                  {t.submit}
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialForm;
