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
    // Get the client's IP from headers (Supabase provides this)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    console.log("Detecting location for IP:", clientIP);

    // Use a free IP geolocation service
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode`);
    
    if (!geoResponse.ok) {
      console.error("Geolocation API error:", geoResponse.status);
      return new Response(JSON.stringify({ 
        country: "unknown", 
        countryCode: "XX",
        currency: "EUR" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geoData = await geoResponse.json();
    console.log("Geolocation data:", geoData);

    // Bosnia and Herzegovina country code is "BA"
    const isBosnia = geoData.countryCode === "BA";
    
    return new Response(JSON.stringify({
      country: geoData.country || "unknown",
      countryCode: geoData.countryCode || "XX",
      currency: isBosnia ? "KM" : "EUR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error detecting location:", error);
    return new Response(JSON.stringify({ 
      country: "unknown", 
      countryCode: "XX",
      currency: "EUR" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
