import { supabase } from "@/integrations/supabase/client";

type Language = "sr" | "en" | "de";

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

// Queue for batching translation requests
let batchQueue: { text: string; resolve: (value: string) => void; reject: (error: any) => void }[] = [];
let batchTimeout: NodeJS.Timeout | null = null;
let currentLanguage: Language = "sr";

const processBatch = async (language: Language) => {
  if (batchQueue.length === 0) return;
  
  const currentBatch = [...batchQueue];
  batchQueue = [];
  
  const textsToTranslate: string[] = [];
  const resolvers: { text: string; resolve: (value: string) => void; reject: (error: any) => void }[] = [];
  
  for (const item of currentBatch) {
    const cacheKey = `${item.text}-${language}`;
    if (translationCache.has(cacheKey)) {
      item.resolve(translationCache.get(cacheKey)!);
    } else if (item.text && item.text.trim()) {
      textsToTranslate.push(item.text);
      resolvers.push(item);
    } else {
      item.resolve(item.text);
    }
  }
  
  if (textsToTranslate.length === 0) return;
  
  try {
    console.log(`Batch translating ${textsToTranslate.length} texts to ${language}`);
    
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { texts: textsToTranslate, targetLanguage: language }
    });

    if (error) {
      console.error("Batch translation error:", error);
      // Return original texts on error
      resolvers.forEach((item, index) => {
        item.resolve(textsToTranslate[index]);
      });
      return;
    }

    if (data?.translatedTexts && Array.isArray(data.translatedTexts)) {
      resolvers.forEach((item, index) => {
        const translated = data.translatedTexts[index] || item.text;
        const cacheKey = `${item.text}-${language}`;
        translationCache.set(cacheKey, translated);
        item.resolve(translated);
      });
    } else {
      // Fallback to original texts
      resolvers.forEach((item) => item.resolve(item.text));
    }
  } catch (error) {
    console.error("Batch translation error:", error);
    resolvers.forEach((item) => item.resolve(item.text));
  }
};

export const translateText = async (text: string, targetLanguage: Language): Promise<string> => {
  // If target is Serbian (default), return original
  if (targetLanguage === "sr" || !text || !text.trim()) {
    return text;
  }

  const cacheKey = `${text}-${targetLanguage}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Update current language for batch processing
  currentLanguage = targetLanguage;

  // Add to batch queue
  return new Promise((resolve, reject) => {
    batchQueue.push({ text, resolve, reject });
    
    // Process batch after a short delay to collect more requests
    if (batchTimeout) {
      clearTimeout(batchTimeout);
    }
    
    batchTimeout = setTimeout(() => {
      batchTimeout = null;
      processBatch(currentLanguage);
    }, 50); // 50ms delay to batch requests
  });
};

// Direct batch translation for arrays
export const translateTexts = async (texts: string[], targetLanguage: Language): Promise<string[]> => {
  if (targetLanguage === "sr" || texts.length === 0) {
    return texts;
  }

  // Check cache for all texts
  const results: (string | null)[] = texts.map(text => {
    if (!text || !text.trim()) return text;
    const cacheKey = `${text}-${targetLanguage}`;
    return translationCache.has(cacheKey) ? translationCache.get(cacheKey)! : null;
  });

  // Find texts that need translation
  const missingIndices = results.map((r, i) => r === null ? i : -1).filter(i => i !== -1);
  const textsToTranslate = missingIndices.map(i => texts[i]);

  if (textsToTranslate.length === 0) {
    return results as string[];
  }

  try {
    console.log(`Batch translating ${textsToTranslate.length} texts to ${targetLanguage}`);
    
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { texts: textsToTranslate, targetLanguage }
    });

    if (error) {
      console.error("Batch translation error:", error);
      // Return original texts on error
      missingIndices.forEach((originalIndex, i) => {
        results[originalIndex] = texts[originalIndex];
      });
      return results as string[];
    }

    if (data?.translatedTexts && Array.isArray(data.translatedTexts)) {
      missingIndices.forEach((originalIndex, i) => {
        const translated = data.translatedTexts[i] || texts[originalIndex];
        const cacheKey = `${texts[originalIndex]}-${targetLanguage}`;
        translationCache.set(cacheKey, translated);
        results[originalIndex] = translated;
      });
    } else {
      missingIndices.forEach((originalIndex) => {
        results[originalIndex] = texts[originalIndex];
      });
    }

    return results as string[];
  } catch (error) {
    console.error("Translation error:", error);
    return texts;
  }
};