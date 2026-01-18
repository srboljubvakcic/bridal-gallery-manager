import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Testimonial {
  id: string;
  name: string;
  wedding_date: string | null;
  content: string;
  rating: number | null;
  is_active: boolean | null;
  display_order: number | null;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteTestimonial, setDeleteTestimonial] = useState<Testimonial | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    wedding_date: "",
    content: "",
    rating: 5,
    is_active: true,
  });

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setTestimonials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTestimonial) {
      const { error } = await supabase
        .from("testimonials")
        .update({
          name: formData.name,
          wedding_date: formData.wedding_date || null,
          content: formData.content,
          rating: formData.rating,
          is_active: formData.is_active,
        })
        .eq("id", editingTestimonial.id);

      if (error) {
        toast.error("Greška pri ažuriranju recenzije");
      } else {
        toast.success("Recenzija uspješno ažurirana");
        fetchTestimonials();
      }
    } else {
      const { error } = await supabase.from("testimonials").insert({
        name: formData.name,
        wedding_date: formData.wedding_date || null,
        content: formData.content,
        rating: formData.rating,
        is_active: formData.is_active,
        display_order: testimonials.length,
      });

      if (error) {
        toast.error("Greška pri kreiranju recenzije");
      } else {
        toast.success("Recenzija uspješno kreirana");
        fetchTestimonials();
      }
    }

    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteTestimonial) return;

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", deleteTestimonial.id);

    if (error) {
      toast.error("Greška pri brisanju recenzije");
    } else {
      toast.success("Recenzija uspješno obrisana");
      fetchTestimonials();
    }

    setDeleteTestimonial(null);
  };

  const generateAITestimonials = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-testimonial', {
        body: { count: 3 }
      });

      if (error) {
        throw error;
      }

      if (data?.testimonials && Array.isArray(data.testimonials)) {
        // Insert generated testimonials into database
        for (const testimonial of data.testimonials) {
          await supabase.from("testimonials").insert({
            name: testimonial.name,
            wedding_date: testimonial.wedding_date,
            content: testimonial.content,
            rating: testimonial.rating,
            is_active: true,
            display_order: testimonials.length + data.testimonials.indexOf(testimonial),
          });
        }
        toast.success(`${data.testimonials.length} AI recenzija uspješno generisano`);
        fetchTestimonials();
      } else {
        throw new Error("Neočekivani format odgovora");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Greška pri generisanju AI recenzija");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      wedding_date: "",
      content: "",
      rating: 5,
      is_active: true,
    });
    setEditingTestimonial(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      wedding_date: testimonial.wedding_date || "",
      content: testimonial.content,
      rating: testimonial.rating || 5,
      is_active: testimonial.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Recenzije</h1>
          <p className="text-muted-foreground">Upravljajte recenzijama klijenata</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generateAITestimonials}
            disabled={isGenerating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generisanje..." : "AI Recenzije"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Recenzija
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Uredi Recenziju" : "Nova Recenzija"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Ime</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Marija & Petar"
                  required
                />
              </div>
              <div>
                <Label htmlFor="wedding_date">Datum vjenčanja / lokacija</Label>
                <Input
                  id="wedding_date"
                  value={formData.wedding_date}
                  onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                  placeholder="Vjenčanje u Sarajevu, 2024"
                />
              </div>
              <div>
                <Label htmlFor="content">Recenzija</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Ana je učinila naš poseban dan..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label>Ocjena</Label>
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "fill-gold text-gold"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktivna</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Otkaži
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTestimonial ? "Sačuvaj" : "Kreiraj"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Nemate nijednu recenziju</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj prvu recenziju
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-lg p-6 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-foreground">{testimonial.name}</h3>
                  {testimonial.wedding_date && (
                    <p className="text-muted-foreground text-sm">
                      {testimonial.wedding_date}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(testimonial)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTestimonial(testimonial)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (testimonial.rating || 5)
                        ? "fill-gold text-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm italic">
                "{testimonial.content}"
              </p>
              <div className="mt-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    testimonial.is_active !== false
                      ? "bg-green-500/10 text-green-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {testimonial.is_active !== false ? "Aktivna" : "Neaktivna"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTestimonial} onOpenChange={() => setDeleteTestimonial(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati recenziju?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati recenziju od "{deleteTestimonial?.name}". 
              Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTestimonials;
