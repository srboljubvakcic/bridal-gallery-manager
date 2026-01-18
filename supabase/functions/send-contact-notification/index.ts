import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  message: string;
  admin_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, phone, event_date, message, admin_email }: ContactNotificationRequest = await req.json();

    console.log("Sending notification email to:", admin_email);

    // Format date to EU format (dd/mm/yyyy)
    const formatEUDate = (dateStr: string): string => {
      if (!dateStr) return "Nije naveden";
      try {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return dateStr;
      }
    };

    const formattedDate = formatEUDate(event_date);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Wedding Photography <onboarding@resend.dev>",
        to: [admin_email],
        subject: `Nova poruka od ${name}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf8f5;">
            <h1 style="color: #2d2a26; font-size: 24px; border-bottom: 2px solid #c4a14a; padding-bottom: 10px;">
              Nova poruka sa web stranice
            </h1>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #5a5448; font-size: 18px; margin-bottom: 15px;">Podaci o klijentu:</h2>
              
              <p style="margin: 10px 0;"><strong>Ime:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 10px 0;"><strong>Telefon:</strong> <a href="tel:${phone}">${phone}</a></p>
              <p style="margin: 10px 0;"><strong>Datum vjenčanja:</strong> ${formattedDate}</p>
              
              <h3 style="color: #5a5448; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">Poruka:</h3>
              <div style="background-color: #f5f3ef; padding: 15px; border-radius: 4px; border-left: 4px solid #c4a14a;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #888;">
              <p style="font-size: 12px;">Ova poruka je automatski poslana sa vaše web stranice.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
