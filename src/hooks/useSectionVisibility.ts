import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  gallery: boolean;
  packages: boolean;
  testimonials: boolean;
  contact: boolean;
}

const defaultVisibility: SectionVisibility = {
  hero: true,
  about: true,
  gallery: true,
  packages: true,
  testimonials: true,
  contact: true,
};

export const useSectionVisibility = () => {
  const [sections, setSections] = useState<SectionVisibility>(defaultVisibility);
  const [loading, setLoading] = useState(true);

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

  const updateVisibility = async (newSections: SectionVisibility) => {
    const jsonValue: Json = { ...newSections };
    const { error } = await supabase
      .from("site_settings")
      .update({ value: jsonValue, updated_at: new Date().toISOString() })
      .eq("key", "sections");

    if (!error) {
      setSections(newSections);
      return true;
    }
    return false;
  };

  return { sections, loading, updateVisibility, refetch: fetchVisibility };
};