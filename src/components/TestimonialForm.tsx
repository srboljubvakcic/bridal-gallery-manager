import { useState } from "react";
import { Star, Send, CheckCircle, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const labels = {
  sr: {
    cta: "Ostavite recenziju",
    title: "Podijelite vaše iskustvo",
    description: "Vaša recenzija će biti objavljena nakon odobrenja.",
    name: "Vaše ime",
    name_placeholder: "Marija & Petar",
    wedding: "Datum / lokacija vjenčanja",
    wedding_placeholder: "Vjenčanje u Sarajevu, 2024",
    review: "Vaša recenzija",
    review_placeholder: "Ispričajte nam o vašem iskustvu...",
    rating: "Ocjena",
    submit: "Pošaljite recenziju",
    submitting: "Šaljem...",
    success: "Hvala na vašoj recenziji!",
    error: "Greška pri slanju. Pokušajte ponovo.",
    thank_you: "Hvala vam! ✨",
    thank_you_desc: "Vaša recenzija je uspješno poslana i bit će objavljena nakon pregleda.",
    another: "Ostavite još jednu",
  },
  en: {
    cta: "Leave a Review",
    title: "Share Your Experience",
    description: "Your review will be published after approval.",
    name: "Your name",
    name_placeholder: "Maria & Peter",
    wedding: "Wedding date / location",
    wedding_placeholder: "Wedding in Sarajevo, 2024",
    review: "Your review",
    review_placeholder: "Tell us about your experience...",
    rating: "Rating",
    submit: "Submit Review",
    submitting: "Submitting...",
    success: "Thank you for your review!",
    error: "Error submitting. Please try again.",
    thank_you: "Thank you! ✨",
    thank_you_desc: "Your review has been submitted and will be published after review.",
    another: "Leave another",
  },
  de: {
    cta: "Bewertung hinterlassen",
    title: "Teilen Sie Ihre Erfahrung",
    description: "Ihre Bewertung wird nach Genehmigung veröffentlicht.",
    name: "Ihr Name",
    name_placeholder: "Maria & Peter",
    wedding: "Hochzeitsdatum / Ort",
    wedding_placeholder: "Hochzeit in Sarajevo, 2024",
    review: "Ihre Bewertung",
    review_placeholder: "Erzählen Sie uns von Ihrer Erfahrung...",
    rating: "Bewertung",
    submit: "Bewertung absenden",
    submitting: "Wird gesendet...",
    success: "Vielen Dank für Ihre Bewertung!",
    error: "Fehler beim Senden. Bitte erneut versuchen.",
    thank_you: "Vielen Dank! ✨",
    thank_you_desc: "Ihre Bewertung wurde eingereicht und wird nach Überprüfung veröffentlicht.",
    another: "Weitere hinterlassen",
  },
};

/** Standalone CTA button that opens a review dialog */
const TestimonialForm = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const t = labels[language] || labels.sr;

  const resetForm = () => {
    setName("");
    setWeddingDate("");
    setContent("");
    setRating(5);
    setIsSubmitted(false);
  };

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
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(resetForm, 300);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="group bg-champagne/20 backdrop-blur-sm text-cream border border-champagne/40 hover:bg-champagne/30 px-8 gap-2"
        >
          <MessageSquarePlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          {t.cta}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-charcoal border-cream/10 text-cream">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-cream text-center">
            {t.title}
          </DialogTitle>
          <p className="text-cream/50 text-sm text-center">{t.description}</p>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-14 h-14 text-champagne mx-auto mb-4" />
              <h3 className="font-serif text-xl text-charcoal mb-2">{t.thank_you}</h3>
              <p className="text-charcoal/60 text-sm mb-6">{t.thank_you_desc}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-charcoal/20 text-charcoal hover:bg-charcoal/10"
                  onClick={resetForm}
                >
                  {t.another}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4 pt-2"
            >
              <div>
                <Label htmlFor="review-name" className="text-cream/70 text-sm">
                  {t.name} *
                </Label>
                <Input
                  id="review-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.name_placeholder}
                  required
                  className="mt-1 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/25 focus:border-champagne"
                />
              </div>

              <div>
                <Label htmlFor="review-wedding" className="text-cream/70 text-sm">
                  {t.wedding}
                </Label>
                <Input
                  id="review-wedding"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  placeholder={t.wedding_placeholder}
                  className="mt-1 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/25 focus:border-champagne"
                />
              </div>

              <div>
                <Label className="text-cream/70 text-sm">{t.rating}</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoveredStar || rating)
                            ? "fill-champagne text-champagne"
                            : "text-cream/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="review-content" className="text-cream/70 text-sm">
                  {t.review} *
                </Label>
                <Textarea
                  id="review-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t.review_placeholder}
                  rows={3}
                  required
                  className="mt-1 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/25 focus:border-champagne resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-champagne text-charcoal hover:bg-champagne/90 font-medium"
              >
                {isSubmitting ? (
                  t.submitting
                ) : (
                  <>
                    {t.submit}
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialForm;
