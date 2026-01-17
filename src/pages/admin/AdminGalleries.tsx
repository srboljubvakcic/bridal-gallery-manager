import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
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

interface Gallery {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  display_order: number;
  is_active: boolean;
}

const AdminGalleries = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [deleteGallery, setDeleteGallery] = useState<Gallery | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
  });

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

  useEffect(() => {
    fetchGalleries();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[čć]/g, "c")
      .replace(/[ž]/g, "z")
      .replace(/[š]/g, "s")
      .replace(/[đ]/g, "dj")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.slug || generateSlug(formData.name);

    if (editingGallery) {
      const { error } = await supabase
        .from("galleries")
        .update({
          name: formData.name,
          slug,
          description: formData.description || null,
          is_active: formData.is_active,
        })
        .eq("id", editingGallery.id);

      if (error) {
        toast.error("Greška pri ažuriranju galerije");
      } else {
        toast.success("Galerija uspješno ažurirana");
        fetchGalleries();
      }
    } else {
      const { error } = await supabase.from("galleries").insert({
        name: formData.name,
        slug,
        description: formData.description || null,
        is_active: formData.is_active,
        display_order: galleries.length,
      });

      if (error) {
        toast.error("Greška pri kreiranju galerije");
      } else {
        toast.success("Galerija uspješno kreirana");
        fetchGalleries();
      }
    }

    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteGallery) return;

    const { error } = await supabase
      .from("galleries")
      .delete()
      .eq("id", deleteGallery.id);

    if (error) {
      toast.error("Greška pri brisanju galerije");
    } else {
      toast.success("Galerija uspješno obrisana");
      fetchGalleries();
    }

    setDeleteGallery(null);
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", is_active: true });
    setEditingGallery(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setFormData({
      name: gallery.name,
      slug: gallery.slug,
      description: gallery.description || "",
      is_active: gallery.is_active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Galerije</h1>
          <p className="text-muted-foreground">Upravljajte kategorijama galerija</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Galerija
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGallery ? "Uredi Galeriju" : "Nova Galerija"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Naziv</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Npr. Ceremonija"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="npr-ceremonija"
                />
                <p className="text-muted-foreground text-xs mt-1">
                  Ostavite prazno za automatsko generisanje
                </p>
              </div>
              <div>
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kratak opis galerije..."
                  rows={3}
                />
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
                  {editingGallery ? "Sačuvaj" : "Kreiraj"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">Nemate nijednu galeriju</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Kreiraj prvu galeriju
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="flex items-center gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{gallery.name}</h3>
                <p className="text-muted-foreground text-sm">/{gallery.slug}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  gallery.is_active
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {gallery.is_active ? "Aktivna" : "Neaktivna"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(gallery)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteGallery(gallery)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteGallery} onOpenChange={() => setDeleteGallery(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati galeriju?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati galeriju "{deleteGallery?.name}" i sve
              fotografije u njoj. Ova akcija se ne može poništiti.
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

export default AdminGalleries;
