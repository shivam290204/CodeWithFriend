import { Resend } from "resend";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const provider = process.env.EMAIL_PROVIDER || "console";
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";

let resend: Resend | null = null;
if (provider === "resend") {
  if (!resendApiKey) {
    console.warn("EMAIL_PROVIDER is set to 'resend' but RESEND_API_KEY is missing. Falling back to console.");
  } else {
    resend = new Resend(resendApiKey);
  }
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (provider === "resend" && resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error("Resend error:", error);
      }
      return data;
    } catch (error) {
      console.error("Failed to send email via resend:", error);
    }
  } else {
    // Console mode
    console.log("========== EMAIL DISPATCH ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML):`);
    console.log(html);
    console.log("====================================");
  }
}
