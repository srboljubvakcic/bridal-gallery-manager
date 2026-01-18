import { supabase } from "@/integrations/supabase/client";

type Language = "sr" | "en" | "de";

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

export const translateText = async (text: string, targetLanguage: Language): Promise<string> => {
  // If target is Serbian (default), return original
  if (targetLanguage === "sr" || !text) {
    return text;
  }

  const cacheKey = `${text}-${targetLanguage}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text, targetLanguage }
    });

    if (error) {
      console.error("Translation error:", error);
      return text; // Return original if translation fails
    }

    if (data?.translatedText) {
      translationCache.set(cacheKey, data.translatedText);
      return data.translatedText;
    }

    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

// Hook for translating multiple texts at once
export const translateTexts = async (texts: string[], targetLanguage: Language): Promise<string[]> => {
  if (targetLanguage === "sr") {
    return texts;
  }

  const results = await Promise.all(
    texts.map(text => translateText(text, targetLanguage))
  );

  return results;
};
