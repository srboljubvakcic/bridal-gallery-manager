import { useState, useEffect } from "react";
import { Save, Sparkles, Search, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface SEOSettings {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image: string;
}

const AdminSEO = () => {
  const [settings, setSettings] = useState<SEOSettings>({
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!error && data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((item) => {
        settingsMap[item.key] = String(item.value || "");
      });
      setSettings({
        seo_title: settingsMap.seo_title || "",
        seo_description: settingsMap.seo_description || "",
        seo_keywords: settingsMap.seo_keywords || "",
        og_image: settingsMap.og_image || "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .single();

    if (existing) {
      await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key);
    } else {
      await supabase
        .from("site_settings")
        .insert({ key, value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("seo_title", settings.seo_title),
        saveSetting("seo_description", settings.seo_description),
        saveSetting("seo_keywords", settings.seo_keywords),
        saveSetting("og_image", settings.og_image),
      ]);
      
      // Update document title
      if (settings.seo_title) {
        document.title = settings.seo_title;
      }
      
      // Update meta tags
      updateMetaTag("description", settings.seo_description);
      updateMetaTag("keywords", settings.seo_keywords);
      updateMetaTag("og:title", settings.seo_title);
      updateMetaTag("og:description", settings.seo_description);
      updateMetaTag("og:image", settings.og_image);
      
      toast.success("SEO podešavanja uspješno sačuvana! ✨");
    } catch (error) {
      toast.error("Greška pri spremanju podešavanja");
    }
    setSaving(false);
  };

  const updateMetaTag = (name: string, content: string) => {
    if (!content) return;
    
    let meta = document.querySelector(`meta[name="${name}"]`) || 
               document.querySelector(`meta[property="${name}"]`);
    
    if (!meta) {
      meta = document.createElement("meta");
      if (name.startsWith("og:")) {
        meta.setAttribute("property", name);
      } else {
        meta.setAttribute("name", name);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  const improveWithAI = async () => {
    setImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-seo", {
        body: {
          currentTitle: settings.seo_title,
          currentDescription: settings.seo_description,
          currentKeywords: settings.seo_keywords,
        },
      });

      if (error) throw error;

      if (data) {
        setSettings({
          ...settings,
          seo_title: data.title || settings.seo_title,
          seo_description: data.description || settings.seo_description,
          seo_keywords: data.keywords || settings.seo_keywords,
        });
        toast.success("AI je poboljšao SEO sadržaj! 🚀");
      }
    } catch (error) {
      console.error("AI improvement error:", error);
      toast.error("Greška pri AI poboljšanju");
    }
    setImproving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const titleLength = settings.seo_title.length;
  const descriptionLength = settings.seo_description.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">SEO Podešavanja</h1>
          <p className="text-muted-foreground">
            Optimizirajte stranicu za bolje rangiranje na Google-u
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={improveWithAI} disabled={improving}>
            <Sparkles className="w-4 h-4 mr-2" />
            {improving ? "Poboljšavam..." : "AI Poboljšaj"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Spremam..." : "Sačuvaj"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Preview Card */}
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Pregled u Google pretrazi
          </h2>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-blue-600 text-lg font-medium truncate">
              {settings.seo_title || "Naslov vaše stranice"}
            </p>
            <p className="text-green-700 text-sm">
              {window.location.origin}
            </p>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {settings.seo_description || "Opis vaše stranice koji će se prikazati u rezultatima pretrage..."}
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Meta podaci
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="seo_title">Naslov stranice (Title)</Label>
                <span className={`text-xs ${titleLength > 60 ? 'text-destructive' : titleLength > 50 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {titleLength}/60
                </span>
              </div>
              <Input
                id="seo_title"
                value={settings.seo_title}
                onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                placeholder="Fotografija Vjenčanja | Ime Fotografa"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Preporučeno: 50-60 karaktera. Uključite glavne ključne riječi.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="seo_description">Meta opis (Description)</Label>
                <span className={`text-xs ${descriptionLength > 160 ? 'text-destructive' : descriptionLength > 140 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {descriptionLength}/160
                </span>
              </div>
              <Textarea
                id="seo_description"
                value={settings.seo_description}
                onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                placeholder="Profesionalna fotografija vjenčanja u Sarajevu i okolini. Uhvatite najljepše trenutke vašeg posebnog dana."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Preporučeno: 140-160 karaktera. Opišite šta nudite i gdje.
              </p>
            </div>

            <div>
              <Label htmlFor="seo_keywords">Ključne riječi (Keywords)</Label>
              <Textarea
                id="seo_keywords"
                value={settings.seo_keywords}
                onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })}
                placeholder="fotografija vjenčanja, vjenčani fotograf, Sarajevo, profesionalni fotograf, wedding photography"
                rows={2}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Razdvojite ključne riječi zarezom. Uključite lokaciju i usluge.
              </p>
            </div>

            <div>
              <Label htmlFor="og_image">OG Image URL (za društvene mreže)</Label>
              <Input
                id="og_image"
                value={settings.og_image}
                onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                placeholder="https://..."
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Slika koja će se prikazati kada dijelite link na Facebook, Instagram, itd. Preporučena veličina: 1200x630px
              </p>
            </div>
          </div>
        </div>

        {/* SEO Tips */}
        <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
          <h3 className="font-serif text-lg text-foreground mb-4">💡 Savjeti za bolje rangiranje</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Naslov:</strong> Uključite lokaciju i glavnu uslugu (npr. "Fotograf vjenčanja Sarajevo")</li>
            <li>• <strong>Opis:</strong> Napišite privlačan opis koji poziva na akciju</li>
            <li>• <strong>Ključne riječi:</strong> Koristite riječi koje bi vaši klijenti tražili</li>
            <li>• <strong>Slike:</strong> Dodajte alt tekst na sve fotografije u galeriji</li>
            <li>• <strong>Brzina:</strong> Kompresovane slike ubrzavaju stranicu i poboljšavaju rangiranje</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSEO;
