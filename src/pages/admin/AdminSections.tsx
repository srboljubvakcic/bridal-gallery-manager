import { useState, useEffect } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface SectionVisibility {
  hero: boolean;
  about: boolean;
  gallery: boolean;
  packages: boolean;
  testimonials: boolean;
  contact: boolean;
}

const sectionLabels: Record<keyof SectionVisibility, { name: string; description: string }> = {
  hero: { name: "Hero Sekcija", description: "Glavna slika i naslov na vrhu stranice" },
  about: { name: "O Meni", description: "Sekcija sa informacijama o fotografu" },
  gallery: { name: "Galerija", description: "Pregled galerija fotografija" },
  packages: { name: "Paketi", description: "Fotografski paketi i cijene" },
  testimonials: { name: "Recenzije", description: "Komentari i ocjene klijenata" },
  contact: { name: "Kontakt", description: "Kontakt forma i informacije" },
};

const AdminSections = () => {
  const [sections, setSections] = useState<SectionVisibility>({
    hero: true,
    about: true,
    gallery: true,
    packages: true,
    testimonials: true,
    contact: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchVisibility = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "sections")
      .single();

    if (!error && data?.value) {
      setSections(data.value as unknown as SectionVisibility);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisibility();
  }, []);

  const handleToggle = (section: keyof SectionVisibility) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const jsonValue: Json = { ...sections };
    const { error } = await supabase
      .from("site_settings")
      .update({ value: jsonValue, updated_at: new Date().toISOString() })
      .eq("key", "sections");

    if (error) {
      toast.error("Greška pri spremanju");
    } else {
      toast.success("Uspješno spremljeno");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Sekcije</h1>
          <p className="text-muted-foreground">Uključite ili isključite sekcije na početnoj stranici</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Spremam..." : "Sačuvaj"}
        </Button>
      </div>

      <div className="space-y-4">
        {(Object.keys(sectionLabels) as (keyof SectionVisibility)[]).map((section) => (
          <div
            key={section}
            className={`bg-card rounded-lg p-6 shadow-soft transition-opacity ${
              !sections[section] ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  sections[section] ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {sections[section] ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{sectionLabels[section].name}</h3>
                  <p className="text-sm text-muted-foreground">{sectionLabels[section].description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor={section} className="text-sm text-muted-foreground">
                  {sections[section] ? "Vidljivo" : "Skriveno"}
                </Label>
                <Switch
                  id={section}
                  checked={sections[section]}
                  onCheckedChange={() => handleToggle(section)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Napomena:</strong> Isključene sekcije neće biti vidljive posjetiocima na vašoj web stranici, 
          ali i dalje možete uređivati njihov sadržaj kroz admin panel.
        </p>
      </div>
    </div>
  );
};

export default AdminSections;