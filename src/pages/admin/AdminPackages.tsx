import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

interface Package {
  id: string;
  title: string;
  description: string | null;
  price: number;
  features: string[] | null;
  is_popular: boolean | null;
  display_order: number;
  is_active: boolean | null;
}

const AdminPackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletePackage, setDeletePackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    features: "",
    is_popular: false,
    is_active: true,
  });

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

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const features = formData.features
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f);

    if (editingPackage) {
      const { error } = await supabase
        .from("packages")
        .update({
          title: formData.title,
          description: formData.description || null,
          price: parseFloat(formData.price),
          features,
          is_popular: formData.is_popular,
          is_active: formData.is_active,
        })
        .eq("id", editingPackage.id);

      if (error) {
        toast.error("Greška pri ažuriranju paketa");
      } else {
        toast.success("Paket uspješno ažuriran");
        fetchPackages();
      }
    } else {
      const { error } = await supabase.from("packages").insert({
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        features,
        is_popular: formData.is_popular,
        is_active: formData.is_active,
        display_order: packages.length,
      });

      if (error) {
        toast.error("Greška pri kreiranju paketa");
      } else {
        toast.success("Paket uspješno kreiran");
        fetchPackages();
      }
    }

    resetForm();
  };

  const handleDelete = async () => {
    if (!deletePackage) return;

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", deletePackage.id);

    if (error) {
      toast.error("Greška pri brisanju paketa");
    } else {
      toast.success("Paket uspješno obrisan");
      fetchPackages();
    }

    setDeletePackage(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      features: "",
      is_popular: false,
      is_active: true,
    });
    setEditingPackage(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description || "",
      price: pkg.price.toString(),
      features: pkg.features?.join("\n") || "",
      is_popular: pkg.is_popular || false,
      is_active: pkg.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Paketi</h1>
          <p className="text-muted-foreground">Upravljajte paketima i cijenama</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novi Paket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "Uredi Paket" : "Novi Paket"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Naziv</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Npr. Premium"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Kratak opis</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Najpopularniji izbor"
                />
              </div>
              <div>
                <Label htmlFor="price">Cijena (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="features">Stavke (svaka u novom redu)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="8 sati fotografisanja&#10;400+ fotografija&#10;Online galerija"
                  rows={5}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                  />
                  <Label htmlFor="is_popular">Najpopularniji</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktivan</Label>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Otkaži
                </Button>
                <Button type="submit" className="flex-1">
                  {editingPackage ? "Sačuvaj" : "Kreiraj"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">Nemate nijedan paket</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Kreiraj prvi paket
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-card rounded-lg p-6 shadow-card ${
                pkg.is_popular ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl text-foreground">{pkg.title}</h3>
                  <p className="text-2xl font-serif text-primary mt-1">€{pkg.price}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(pkg)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletePackage(pkg)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {pkg.description && (
                <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
              )}
              {pkg.features && pkg.features.length > 0 && (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {pkg.features.slice(0, 4).map((feature, i) => (
                    <li key={i}>• {feature}</li>
                  ))}
                  {pkg.features.length > 4 && (
                    <li className="text-primary">+{pkg.features.length - 4} više</li>
                  )}
                </ul>
              )}
              <div className="mt-4 flex gap-2">
                {pkg.is_popular && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Popularan
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    pkg.is_active !== false
                      ? "bg-green-500/10 text-green-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pkg.is_active !== false ? "Aktivan" : "Neaktivan"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletePackage} onOpenChange={() => setDeletePackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati paket?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati paket "{deletePackage?.title}". Ova akcija se ne može poništiti.
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

export default AdminPackages;
