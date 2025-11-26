import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StoryEmailRequest {
  storyContent: string;
  genre: string;
  theme: string;
  characterType: string;
  title: string;
  userEmail?: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyContent, genre, theme, characterType, title, userEmail, userName }: StoryEmailRequest = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log("Sending story email notification");

    const emailPayload = {
      from: "Story Generator <onboarding@resend.dev>",
      to: ["mohdmaazgani@gmail.com"],
      subject: `New Story Generated: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">New Story Generated</h1>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h2 style="color: #8B4513; margin-top: 0;">Story Details</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Genre:</strong> ${genre}</p>
            <p><strong>Theme:</strong> ${theme}</p>
            <p><strong>Character Type:</strong> ${characterType}</p>
            ${userEmail ? `<p><strong>User Email:</strong> ${userEmail}</p>` : ''}
            ${userName ? `<p><strong>User Name:</strong> ${userName}</p>` : '<p><em>Anonymous user</em></p>'}
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #fff; padding: 20px; border-left: 4px solid #8B4513; margin: 20px 0;">
            <h2 style="color: #8B4513; margin-top: 0;">Story Content</h2>
            <div style="line-height: 1.6; color: #333;">
              ${storyContent}
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This email was sent automatically from your Story Generator application.</p>
          </div>
        </div>
      `,
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${emailResponse.status} ${errorData}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-story-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
