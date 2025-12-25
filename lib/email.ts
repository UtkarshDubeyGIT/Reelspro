import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  verificationToken: string
) {
  // Determine the base URL - prioritize custom domain, then production URLs
  // APP_URL takes highest priority (for custom domains like dubey.tech)
  let baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL;

  // Check for Vercel deployment URL (automatically set by Vercel)
  // Only use if APP_URL is not set (to allow custom domain override)
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && (!baseUrl || baseUrl.includes("localhost"))) {
    baseUrl = `https://${vercelUrl}`;
  }

  // Check for other common deployment platform environment variables
  // Add more as needed for your deployment platform
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (renderUrl && (!baseUrl || baseUrl.includes("localhost"))) {
    baseUrl = renderUrl;
  }

  // Fallback logic
  if (!baseUrl || baseUrl.includes("localhost")) {
    if (process.env.NODE_ENV === "production") {
      // In production, warn if still using localhost
      console.warn(
        "⚠️  WARNING: NEXTAUTH_URL is set to localhost in production. " +
          "Please set NEXTAUTH_URL to your production URL in your environment variables."
      );
    }
    baseUrl = baseUrl || "http://localhost:3000";
  }

  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  // In development/testing mode, Resend only allows sending to verified email
  // If RESEND_TEST_EMAIL is set, use it for testing
  const testEmail = process.env.RESEND_TEST_EMAIL;
  const isDevelopment = process.env.NODE_ENV === "development";
  const recipientEmail = isDevelopment && testEmail ? testEmail : email;
  const isTestMode = recipientEmail !== email;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ReelsPro</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ${
            isTestMode
              ? `
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>TEST MODE:</strong> This email was sent to the test address. The actual recipient is: <strong>${email}</strong>
              </p>
            </div>
          `
              : ""
          }
          <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
          <p style="color: #666; font-size: 16px;">
            Thanks for signing up for ReelsPro! To complete your registration and start sharing amazing reels, please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${verificationUrl}
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            This verification link will expire in 24 hours. If you didn't create an account with ReelsPro, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: recipientEmail,
      subject: "Verify your ReelsPro account",
      html: emailHtml,
    });

    if (isTestMode) {
      console.log(
        `[TEST MODE] Verification email sent to test address: ${recipientEmail}`
      );
      console.log(`[TEST MODE] Actual recipient: ${email}`);
      console.log(`[TEST MODE] Verification link: ${verificationUrl}`);
    }

    return result;
  } catch (error: unknown) {
    console.error("Error sending verification email:", error);

    // Provide more helpful error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("validation_error") ||
      errorMessage.includes("testing emails")
    ) {
      const detailedErrorMessage = `Resend API Error: ${errorMessage}. 
      
For development/testing:
1. Set RESEND_TEST_EMAIL in your .env file to your verified Resend email address
2. Or verify a domain at resend.com/domains and update RESEND_FROM_EMAIL to use that domain

Current configuration:
- RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}
- RESEND_TEST_EMAIL: ${testEmail || "not set"}
- Recipient: ${email}`;

      throw new Error(detailedErrorMessage);
    }

    throw error;
  }
}
