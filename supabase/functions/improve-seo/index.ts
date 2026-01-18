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

    const { currentTitle, currentDescription, currentKeywords } = await req.json();

    console.log("Improving SEO for:", { currentTitle, currentDescription, currentKeywords });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Ti si SEO ekspert specijalizovan za web stranice fotografa vjenčanja na Balkanu.
Tvoj zadatak je da poboljšaš SEO meta podatke za bolje rangiranje na Google-u.

Pravila:
- Naslov: maksimalno 60 karaktera, uključi ključne riječi i lokaciju
- Opis: maksimalno 160 karaktera, privlačan i poziva na akciju
- Ključne riječi: relevantne za fotografiju vjenčanja, lokaciju, usluge

Koristi srpski/bosanski jezik (ijekavica).`
          },
          {
            role: "user",
            content: `Poboljšaj sljedeće SEO podatke za web stranicu fotografa vjenčanja:

Trenutni naslov: ${currentTitle || "(prazan)"}
Trenutni opis: ${currentDescription || "(prazan)"}
Trenutne ključne riječi: ${currentKeywords || "(prazno)"}

Vrati poboljšane verzije u JSON formatu.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "improve_seo",
              description: "Improve SEO metadata for wedding photography website",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string", 
                    description: "Improved page title (max 60 chars)" 
                  },
                  description: { 
                    type: "string", 
                    description: "Improved meta description (max 160 chars)" 
                  },
                  keywords: { 
                    type: "string", 
                    description: "Improved keywords comma separated" 
                  }
                },
                required: ["title", "description", "keywords"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "improve_seo" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Previše zahtjeva, pokušajte ponovo kasnije." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Greška pri poboljšanju SEO" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      console.log("Improved SEO:", parsed);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Neočekivani format odgovora" }), {
      status: 500,
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
