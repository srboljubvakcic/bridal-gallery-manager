import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HeroSettings {
  title: string;
  title_accent: string;
  subtitle: string;
  description: string;
  image: string;
  cta_text: string;
  cta_secondary_text: string;
}

export interface AboutSettings {
  name: string;
  title: string;
  description: string;
  description2: string;
  image: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  address_note: string;
  instagram: string;
  facebook: string;
}

export interface CTASettings {
  subtitle: string;
  title: string;
  description: string;
  button_text: string;
}

export interface FooterSettings {
  brand_name: string;
  description: string;
  logo: string;
}

export interface SiteSettings {
  hero: HeroSettings;
  about: AboutSettings;
  contact: ContactSettings;
  cta: CTASettings;
  footer: FooterSettings;
}

const defaultSettings: SiteSettings = {
  hero: {
    title: "Čuvam Vašu",
    title_accent: "Vječnost",
    subtitle: "Fotografija Vjenčanja",
    description: "Čuvam najljepše trenutke vašeg posebnog dana s umjetničkom elegancijom i bezvremenskom gracioznošću.",
    image: "",
    cta_text: "Kontaktirajte me",
    cta_secondary_text: "Pogledaj galeriju",
  },
  about: {
    name: "Ana",
    title: "Zdravo, ja sam Ana",
    description: "Već više od 8 godina s ljubavlju bilježim priče o ljubavi.",
    description2: "Svako vjenčanje je jedinstveno.",
    image: "",
  },
  contact: {
    email: "info@anafotografija.com",
    phone: "+387 61 234 567",
    address: "Sarajevo, Bosna i Hercegovina",
    address_note: "Dostupna za putovanja širom regije",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
  cta: {
    subtitle: "Spremni ste?",
    title: "Započnimo Vašu Priču",
    description: "Vaša ljubavna priča zaslužuje da bude ispričana.",
    button_text: "Rezervirajte Termin",
  },
  footer: {
    brand_name: "Ana Fotografija",
    description: "Profesionalna fotografija vjenčanja.",
    logo: "",
  },
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (!error && data) {
        const newSettings = { ...defaultSettings };
        data.forEach((item) => {
          const key = item.key as keyof SiteSettings;
          if (key in newSettings) {
            newSettings[key] = item.value as any;
          }
        });
        setSettings(newSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};
