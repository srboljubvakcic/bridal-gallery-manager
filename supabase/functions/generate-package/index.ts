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

    const { count = 1, existingPackages = [] } = await req.json();

    console.log("Generating", count, "packages. Existing:", existingPackages);

    const existingInfo = existingPackages.length > 0 
      ? `Već postoje sljedeći paketi: ${existingPackages.map((p: any) => `${p.title} (${p.price} KM)`).join(", ")}. Generiši RAZLIČITE pakete.`
      : "";

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
            content: `Ti si generator paketa usluga za web stranicu fotografa vjenčanja.
Generiši realistične pakete sa cijenama u KM (konvertibilna marka) koje su tipične za Bosnu i Hercegovinu.
Cijene bi trebale biti između 500 KM i 3000 KM.
Svaki paket treba imati 4-8 stavki koje opisuju šta je uključeno.
Koristi srpski/bosanski jezik (ijekavica).`
          },
          {
            role: "user",
            content: `Generiši ${count} paket(a) za fotografa vjenčanja.
${existingInfo}

Vrati JSON niz sa objektima koji imaju sljedeća polja:
- title: naziv paketa (npr. "Basic", "Premium", "Exclusive")
- description: kratak opis paketa
- price: cijena u KM (broj)
- features: niz stavki koje su uključene
- is_popular: da li je najpopularniji (samo jedan može biti true)

Vrati SAMO validan JSON niz.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_packages",
              description: "Generate wedding photography packages",
              parameters: {
                type: "object",
                properties: {
                  packages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Package name" },
                        description: { type: "string", description: "Short description" },
                        price: { type: "number", description: "Price in KM" },
                        features: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "List of included features" 
                        },
                        is_popular: { type: "boolean", description: "Is this the most popular package" }
                      },
                      required: ["title", "description", "price", "features", "is_popular"]
                    }
                  }
                },
                required: ["packages"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_packages" } }
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
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Potrebno je dodati kredite za AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Greška pri generisanju paketa" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      console.log("Generated packages:", parsed);
      return new Response(JSON.stringify({ packages: parsed.packages }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const packages = JSON.parse(content);
        return new Response(JSON.stringify({ packages: Array.isArray(packages) ? packages : [packages] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse content as JSON:", content);
      }
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
