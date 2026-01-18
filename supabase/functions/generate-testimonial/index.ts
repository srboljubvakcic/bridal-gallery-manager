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

    const { count = 1 } = await req.json();

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
            content: `Ti si generator realističnih recenzija za web stranicu fotografa vjenčanja. 
Generiši autentične, emocionalne recenzije na srpskom jeziku (ijekavica) koje djeluju kao da su napisane od strane pravih parova.
Recenzije treba da budu različite po tonu i sadržaju - neke fokusirane na kvalitet fotografija, neke na profesionalnost fotografa, neke na emocije i uspomene.
Koristi realistična srpska/bosanska/hrvatska imena parova.`
          },
          {
            role: "user",
            content: `Generiši ${count} recenzija za fotografa vjenčanja. Vrati JSON niz sa objektima koji imaju sljedeća polja:
- name: ime para (npr. "Marija & Petar", "Ana & Stefan")
- wedding_date: lokacija i godina vjenčanja (npr. "Vjenčanje u Sarajevu, 2024")
- content: tekst recenzije (2-4 rečenice, emocionalno i autentično)
- rating: ocjena od 4 do 5

Vrati SAMO validan JSON niz, bez dodatnog teksta.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_testimonials",
              description: "Generate realistic wedding photography testimonials",
              parameters: {
                type: "object",
                properties: {
                  testimonials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Couple names like 'Marija & Petar'" },
                        wedding_date: { type: "string", description: "Wedding location and year" },
                        content: { type: "string", description: "Testimonial text in Serbian" },
                        rating: { type: "number", description: "Rating from 4 to 5" }
                      },
                      required: ["name", "wedding_date", "content", "rating"]
                    }
                  }
                },
                required: ["testimonials"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_testimonials" } }
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Greška pri generisanju recenzija" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract testimonials from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ testimonials: parsed.testimonials }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const testimonials = JSON.parse(content);
        return new Response(JSON.stringify({ testimonials: Array.isArray(testimonials) ? testimonials : [testimonials] }), {
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
