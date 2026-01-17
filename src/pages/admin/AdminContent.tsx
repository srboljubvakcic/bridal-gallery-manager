import { useState, useEffect, useRef } from "react";
import { Save, FileText, Image, Phone, Type, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface SiteSettingsData {
  [key: string]: Record<string, string>;
}

const AdminContent = () => {
  const [settings, setSettings] = useState<SiteSettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const aboutFileRef = useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!error && data) {
      const settingsMap: SiteSettingsData = {};
      data.forEach((item) => {
        settingsMap[item.key] = item.value as Record<string, string>;
      });
      setSettings(settingsMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);

    const { error } = await supabase
      .from("site_settings")
      .update({ value: settings[key] })
      .eq("key", key);

    if (error) {
      toast.error("Greška pri spremanju");
    } else {
      toast.success("Uspješno sačuvano");
    }

    setSaving(null);
  };

  const updateField = (section: string, field: string, value: string) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const handleImageUpload = async (
    file: File,
    section: "hero" | "about",
    field: string
  ) => {
    const setUploading = section === "hero" ? setUploadingHero : setUploadingAbout;
    setUploading(true);

    try {
      // Delete old image if exists
      const oldUrl = settings[section]?.[field];
      if (oldUrl && oldUrl.includes("site-images")) {
        const urlParts = oldUrl.split("/site-images/");
        if (urlParts.length > 1) {
          await supabase.storage.from("site-images").remove([urlParts[1]]);
        }
      }

      // Upload new image
      const fileExt = file.name.split(".").pop();
      const fileName = `${section}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error("Greška pri uploadu slike");
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      // Update settings with new image URL
      updateField(section, field, publicUrl);

      // Save to database immediately
      const updatedSettings = {
        ...settings[section],
        [field]: publicUrl,
      };

      const { error: saveError } = await supabase
        .from("site_settings")
        .update({ value: updatedSettings })
        .eq("key", section);

      if (saveError) {
        toast.error("Greška pri spremanju");
      } else {
        toast.success("Slika uspješno uploadana");
        fetchSettings();
      }
    } catch {
      toast.error("Greška pri uploadu");
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">Podešavanja Sajta</h1>
        <p className="text-muted-foreground">
          Uredite sve tekstove, slike i kontakt informacije
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="hero" className="gap-2">
            <Image className="w-4 h-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <Type className="w-4 h-4" />
            O Meni
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="w-4 h-4" />
            Kontakt
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2">
            <FileText className="w-4 h-4" />
            Footer
          </TabsTrigger>
        </TabsList>

        {/* Hero Settings */}
        <TabsContent value="hero" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Hero Sekcija
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Podnaslov</Label>
                <Input
                  value={settings.hero?.subtitle || ""}
                  onChange={(e) => updateField("hero", "subtitle", e.target.value)}
                  placeholder="Fotografija Vjenčanja"
                />
              </div>
              <div>
                <Label>Naslov</Label>
                <Input
                  value={settings.hero?.title || ""}
                  onChange={(e) => updateField("hero", "title", e.target.value)}
                  placeholder="Čuvam Vašu"
                />
              </div>
              <div>
                <Label>Naslov akcenat (italik)</Label>
                <Input
                  value={settings.hero?.title_accent || ""}
                  onChange={(e) => updateField("hero", "title_accent", e.target.value)}
                  placeholder="Vječnost"
                />
              </div>
              <div>
                <Label>Hero Slika</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={heroFileRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "hero", "image");
                    }}
                    disabled={uploadingHero}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => heroFileRef.current?.click()}
                    disabled={uploadingHero}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingHero ? "Uploadam..." : "Upload slike"}
                  </Button>
                </div>
                {settings.hero?.image && (
                  <div className="mt-2">
                    <img
                      src={settings.hero.image}
                      alt="Hero preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label>Opis</Label>
                <Textarea
                  value={settings.hero?.description || ""}
                  onChange={(e) => updateField("hero", "description", e.target.value)}
                  placeholder="Čuvam najljepše trenutke..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Tekst glavnog dugmeta</Label>
                <Input
                  value={settings.hero?.cta_text || ""}
                  onChange={(e) => updateField("hero", "cta_text", e.target.value)}
                  placeholder="Rezervišite Termin"
                />
              </div>
              <div>
                <Label>Tekst sekundarnog dugmeta</Label>
                <Input
                  value={settings.hero?.cta_secondary_text || ""}
                  onChange={(e) => updateField("hero", "cta_secondary_text", e.target.value)}
                  placeholder="Pogledaj galeriju"
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave("hero")}
              disabled={saving === "hero"}
              className="mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving === "hero" ? "Spremam..." : "Sačuvaj"}
            </Button>
          </div>
        </TabsContent>

        {/* About Settings */}
        <TabsContent value="about" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              O Meni Sekcija
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Ime</Label>
                  <Input
                    value={settings.about?.name || ""}
                    onChange={(e) => updateField("about", "name", e.target.value)}
                    placeholder="Ana"
                  />
                </div>
                <div>
                  <Label>Naslov</Label>
                  <Input
                    value={settings.about?.title || ""}
                    onChange={(e) => updateField("about", "title", e.target.value)}
                    placeholder="Zdravo, ja sam Ana"
                  />
                </div>
              </div>
              <div>
                <Label>Slika</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={aboutFileRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "about", "image");
                    }}
                    disabled={uploadingAbout}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => aboutFileRef.current?.click()}
                    disabled={uploadingAbout}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingAbout ? "Uploadam..." : "Upload slike"}
                  </Button>
                </div>
                {settings.about?.image && (
                  <div className="mt-2">
                    <img
                      src={settings.about.image}
                      alt="About preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Prvi paragraf</Label>
                <Textarea
                  value={settings.about?.description || ""}
                  onChange={(e) => updateField("about", "description", e.target.value)}
                  placeholder="Već više od 8 godina..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Drugi paragraf</Label>
                <Textarea
                  value={settings.about?.description2 || ""}
                  onChange={(e) => updateField("about", "description2", e.target.value)}
                  placeholder="Svako vjenčanje je jedinstveno..."
                  rows={4}
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave("about")}
              disabled={saving === "about"}
              className="mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving === "about" ? "Spremam..." : "Sačuvaj"}
            </Button>
          </div>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Kontakt Informacije
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={settings.contact?.email || ""}
                  onChange={(e) => updateField("contact", "email", e.target.value)}
                  placeholder="info@anafotografija.com"
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input
                  value={settings.contact?.phone || ""}
                  onChange={(e) => updateField("contact", "phone", e.target.value)}
                  placeholder="+387 61 234 567"
                />
              </div>
              <div>
                <Label>Adresa</Label>
                <Input
                  value={settings.contact?.address || ""}
                  onChange={(e) => updateField("contact", "address", e.target.value)}
                  placeholder="Sarajevo, Bosna i Hercegovina"
                />
              </div>
              <div>
                <Label>Napomena za adresu</Label>
                <Input
                  value={settings.contact?.address_note || ""}
                  onChange={(e) => updateField("contact", "address_note", e.target.value)}
                  placeholder="Dostupna za putovanja širom regije"
                />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input
                  value={settings.contact?.instagram || ""}
                  onChange={(e) => updateField("contact", "instagram", e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <Label>Facebook URL</Label>
                <Input
                  value={settings.contact?.facebook || ""}
                  onChange={(e) => updateField("contact", "facebook", e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave("contact")}
              disabled={saving === "contact"}
              className="mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving === "contact" ? "Spremam..." : "Sačuvaj"}
            </Button>
          </div>
        </TabsContent>

        {/* Footer Settings */}
        <TabsContent value="footer" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Footer
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Naziv brenda</Label>
                <Input
                  value={settings.footer?.brand_name || ""}
                  onChange={(e) => updateField("footer", "brand_name", e.target.value)}
                  placeholder="Ana Fotografija"
                />
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea
                  value={settings.footer?.description || ""}
                  onChange={(e) => updateField("footer", "description", e.target.value)}
                  placeholder="Profesionalna fotografija vjenčanja..."
                  rows={3}
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave("footer")}
              disabled={saving === "footer"}
              className="mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving === "footer" ? "Spremam..." : "Sačuvaj"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;