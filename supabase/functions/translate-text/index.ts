import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const { text, texts, targetLanguage } = body;

    // Support both single text and batch texts
    const textsToTranslate = texts || (text ? [text] : []);
    
    if (textsToTranslate.length === 0 || !targetLanguage) {
      return new Response(JSON.stringify({ error: "Missing text(s) or targetLanguage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const languageNames: Record<string, string> = {
      sr: "Serbian (ijekavica dialect)",
      en: "English",
      de: "German"
    };

    // For batch translations, join texts with a delimiter
    const isBatch = textsToTranslate.length > 1;
    const delimiter = "|||SPLIT|||";
    const inputText = isBatch 
      ? textsToTranslate.join(`\n${delimiter}\n`)
      : textsToTranslate[0];

    const systemPrompt = isBatch
      ? `You are a professional translator for a wedding photography website. Translate each text segment to ${languageNames[targetLanguage] || targetLanguage}.
The input contains multiple texts separated by "${delimiter}".
Return ONLY the translations, keeping the same separator "${delimiter}" between each translated text.
Keep translations natural and elegant. Do not include explanations.`
      : `You are a professional translator specializing in wedding photography website content. Translate the given text to ${languageNames[targetLanguage] || targetLanguage}. 
Keep the translation natural and elegant, appropriate for a wedding photography website.
Return ONLY the translated text, nothing else. Do not include any explanations or notes.`;

    console.log(`Translating ${textsToTranslate.length} text(s) to ${targetLanguage}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: inputText }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        // Return 200 with error field to prevent supabase-js from throwing FunctionsHttpError
        return new Response(JSON.stringify({ error: "Rate limits exceeded", translatedTexts: null, translatedText: null }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Translation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content?.trim();

    if (!translatedContent) {
      return new Response(JSON.stringify({ error: "No translation returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse batch response
    if (isBatch) {
      const translatedTexts = translatedContent.split(delimiter).map((t: string) => t.trim());
      console.log(`Translated ${translatedTexts.length} texts successfully`);
      return new Response(JSON.stringify({ translatedTexts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single text response (backward compatible)
    return new Response(JSON.stringify({ translatedText: translatedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});