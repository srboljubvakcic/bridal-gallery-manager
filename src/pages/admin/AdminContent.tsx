import { useState, useEffect } from "react";
import { Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PageContent {
  id: string;
  slug: string;
  title: string | null;
  content: Record<string, string>;
}

const AdminContent = () => {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .order("slug");

    if (!error && data) {
      setPages(data as PageContent[]);
      const initialData: Record<string, Record<string, string>> = {};
      data.forEach((page) => {
        initialData[page.slug] = page.content as Record<string, string>;
      });
      setFormData(initialData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (slug: string) => {
    setSaving(slug);

    const { error } = await supabase
      .from("page_content")
      .update({ content: formData[slug] })
      .eq("slug", slug);

    if (error) {
      toast.error("Greška pri spremanju sadržaja");
    } else {
      toast.success("Sadržaj uspješno spremljen");
    }

    setSaving(null);
  };

  const updateField = (slug: string, field: string, value: string) => {
    setFormData({
      ...formData,
      [slug]: {
        ...formData[slug],
        [field]: value,
      },
    });
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
        <h1 className="font-serif text-3xl text-foreground mb-2">Sadržaj Stranica</h1>
        <p className="text-muted-foreground">
          Uredite tekstualni sadržaj na stranicama
        </p>
      </div>

      <Tabs defaultValue="home" className="space-y-6">
        <TabsList>
          <TabsTrigger value="home">Početna</TabsTrigger>
          <TabsTrigger value="about">O meni</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Hero Sekcija
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Naslov</Label>
                <Input
                  value={formData.home?.hero_title || ""}
                  onChange={(e) => updateField("home", "hero_title", e.target.value)}
                  placeholder="Capturing Your Forever"
                />
              </div>
              <div>
                <Label>Podnaslov</Label>
                <Input
                  value={formData.home?.hero_subtitle || ""}
                  onChange={(e) => updateField("home", "hero_subtitle", e.target.value)}
                  placeholder="Wedding Photography"
                />
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea
                  value={formData.home?.hero_description || ""}
                  onChange={(e) => updateField("home", "hero_description", e.target.value)}
                  placeholder="Preserving the most beautiful moments..."
                  rows={3}
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave("home")}
              disabled={saving === "home"}
              className="mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving === "home" ? "Spremam..." : "Sačuvaj promjene"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              O Meni Stranica
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Naslov</Label>
                <Input
                  value={formData.about?.title || ""}
                  onChange={(e) => updateField("about", "title", e.target.value)}
                  placeholder="Hello, I'm Ana"
                />
              </div>
              <div>
                <Label>Glavni tekst</Label>
                <Textarea
                  value={formData.about?.description || ""}
                  onChange={(e) => updateField("about", "description", e.target.value)}
                  placeholder="I am a passionate wedding photographer..."
                  rows={5}
                />
              </div>
              <div>
                <Label>Filozofija</Label>
                <Textarea
                  value={formData.about?.philosophy || ""}
                  onChange={(e) => updateField("about", "philosophy", e.target.value)}
                  placeholder="Every wedding is unique..."
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
              {saving === "about" ? "Spremam..." : "Sačuvaj promjene"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
