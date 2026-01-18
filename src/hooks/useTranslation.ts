import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateText, translateTexts } from "@/lib/translate";

export const useTranslation = () => {
  const { language } = useLanguage();

  const translate = useCallback(async (text: string): Promise<string> => {
    return translateText(text, language);
  }, [language]);

  const translateMultiple = useCallback(async (texts: string[]): Promise<string[]> => {
    return translateTexts(texts, language);
  }, [language]);

  return { translate, translateMultiple, language };
};

// Hook for translating a single text with state
export const useTranslatedText = (originalText: string) => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === "sr" || !originalText) {
      setTranslatedText(originalText);
      return;
    }

    const doTranslate = async () => {
      setIsLoading(true);
      const result = await translateText(originalText, language);
      setTranslatedText(result);
      setIsLoading(false);
    };

    doTranslate();
  }, [originalText, language]);

  return { text: translatedText, isLoading };
};

// Hook for translating an array of objects with specific fields
export const useTranslatedContent = <T extends Record<string, any>>(
  items: T[],
  fieldsToTranslate: (keyof T)[]
) => {
  const { language } = useLanguage();
  const [translatedItems, setTranslatedItems] = useState<T[]>(items);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === "sr" || items.length === 0) {
      setTranslatedItems(items);
      return;
    }

    const doTranslate = async () => {
      setIsLoading(true);
      
      const translatedItemsArray = await Promise.all(
        items.map(async (item) => {
          const translatedItem = { ...item };
          
          for (const field of fieldsToTranslate) {
            const value = item[field];
            if (typeof value === "string" && value) {
              (translatedItem as any)[field] = await translateText(value, language);
            } else if (Array.isArray(value)) {
              (translatedItem as any)[field] = await translateTexts(
                value.filter((v): v is string => typeof v === "string"),
                language
              );
            }
          }
          
          return translatedItem;
        })
      );

      setTranslatedItems(translatedItemsArray);
      setIsLoading(false);
    };

    doTranslate();
  }, [items, language, fieldsToTranslate.join(",")]);

  return { items: translatedItems, isLoading };
};
