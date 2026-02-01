import { supabase } from "@/integrations/supabase/client";

type Language = "sr" | "en" | "de";

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

// Pending requests map to avoid duplicate translations
const pendingTranslations = new Map<string, Promise<string>>();

// Queue for batching translation requests
let batchQueue: { text: string; language: Language; resolve: (value: string) => void; reject: (error: any) => void }[] = [];
let batchTimeout: NodeJS.Timeout | null = null;
let isProcessingBatch = false;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500; // be conservative to avoid 429 bursts

// Circuit breaker: when we hit 429, stop attempting translations for a short period
let rateLimitedUntil = 0;
const RATE_LIMIT_COOLDOWN_MS = 10_000;

const processBatch = async () => {
  if (batchQueue.length === 0 || isProcessingBatch) return;
  
  isProcessingBatch = true;
  const currentBatch = [...batchQueue];
  batchQueue = [];
  
  // Group by language
  const byLanguage = new Map<Language, typeof currentBatch>();
  for (const item of currentBatch) {
    const lang = item.language;
    if (!byLanguage.has(lang)) {
      byLanguage.set(lang, []);
    }
    byLanguage.get(lang)!.push(item);
  }
  
  // Process each language group
  for (const [language, items] of byLanguage) {
    // Deduplicate texts while keeping track of all resolvers
    const uniqueTexts: string[] = [];
    const textToResolvers = new Map<string, typeof items>();
    
    for (const item of items) {
      const cacheKey = `${item.text}-${language}`;
      
      // Check cache first
      if (translationCache.has(cacheKey)) {
        item.resolve(translationCache.get(cacheKey)!);
        continue;
      }
      
      // Skip empty texts
      if (!item.text || !item.text.trim()) {
        item.resolve(item.text);
        continue;
      }
      
      // Group resolvers by unique text
      if (!textToResolvers.has(item.text)) {
        textToResolvers.set(item.text, []);
        uniqueTexts.push(item.text);
      }
      textToResolvers.get(item.text)!.push(item);
    }
    
    if (uniqueTexts.length === 0) continue;

    // If we're currently rate-limited, fail fast (resolve originals) to avoid blank screen
    if (Date.now() < rateLimitedUntil) {
      for (const [text, resolvers] of textToResolvers) {
        for (const resolver of resolvers) {
          resolver.resolve(text);
        }
      }
      continue;
    }
    
    // Rate limiting - wait if needed
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    try {
      console.log(`Batch translating ${uniqueTexts.length} unique texts to ${language}`);
      lastRequestTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { texts: uniqueTexts, targetLanguage: language }
      });

      if (error) {
        // Supabase wraps non-2xx as FunctionsHttpError (status isn't reliably exposed in the error object).
        // Treat it as rate-limit-ish to stop request storms and avoid blank screens.
        const errAny = error as any;
        const isFunctionsHttpError = errAny?.name === "FunctionsHttpError";
        const looksLike429 = errAny?.status === 429 || errAny?.context?.status === 429 || error.message?.includes("429") || error.message?.includes("Rate limit");

        if (isFunctionsHttpError || looksLike429) {
          console.warn("Translation function returned non-2xx; entering cooldown and falling back to originals.");
          rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;

          for (const [text, resolvers] of textToResolvers) {
            for (const resolver of resolvers) {
              resolver.resolve(text);
            }
          }

          continue;
        }
        
        console.error("Batch translation error:", error);
        // Return original texts on error
        for (const [text, resolvers] of textToResolvers) {
          for (const resolver of resolvers) {
            resolver.resolve(text);
          }
        }
        continue;
      }

      if (data?.translatedTexts && Array.isArray(data.translatedTexts)) {
        uniqueTexts.forEach((originalText, index) => {
          const translated = data.translatedTexts[index] || originalText;
          const cacheKey = `${originalText}-${language}`;
          translationCache.set(cacheKey, translated);
          
          // Resolve all waiting promises for this text
          const resolvers = textToResolvers.get(originalText) || [];
          for (const resolver of resolvers) {
            resolver.resolve(translated);
          }
        });
      } else {
        // Fallback to original texts
        for (const [text, resolvers] of textToResolvers) {
          for (const resolver of resolvers) {
            resolver.resolve(text);
          }
        }
      }
    } catch (error) {
      console.error("Batch translation error:", error);
      for (const [text, resolvers] of textToResolvers) {
        for (const resolver of resolvers) {
          resolver.resolve(text);
        }
      }
    }
  }
  
  isProcessingBatch = false;
  
  // Process any items that were added during processing
  if (batchQueue.length > 0) {
    setTimeout(processBatch, MIN_REQUEST_INTERVAL);
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

  // If we're currently rate-limited, fail fast (return original) to avoid UI stalls
  if (Date.now() < rateLimitedUntil) {
    return text;
  }
  
  // Check if there's already a pending translation for this exact text+language
  const pendingKey = `${text}-${targetLanguage}`;
  if (pendingTranslations.has(pendingKey)) {
    return pendingTranslations.get(pendingKey)!;
  }

  // Create a promise for this translation
  const promise = new Promise<string>((resolve, reject) => {
    batchQueue.push({ text, language: targetLanguage, resolve, reject });
    
    // Process batch after a delay to collect more requests
    if (batchTimeout) {
      clearTimeout(batchTimeout);
    }
    
    batchTimeout = setTimeout(() => {
      batchTimeout = null;
      processBatch();
    }, 300); // a bit longer to merge bursts into fewer calls
  });
  
  // Store the pending promise
  pendingTranslations.set(pendingKey, promise);
  
  // Clean up pending after resolution
  promise.finally(() => {
    pendingTranslations.delete(pendingKey);
  });
  
  return promise;
};

// Direct batch translation for arrays
export const translateTexts = async (texts: string[], targetLanguage: Language): Promise<string[]> => {
  if (targetLanguage === "sr" || texts.length === 0) {
    return texts;
  }

  // Translate all texts through the batching system
  return Promise.all(texts.map(text => translateText(text, targetLanguage)));
};