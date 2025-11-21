import { MailerSend, EmailParams, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_SECRET || "",
});

export async function sendMagicLinkEmail(to: string, url: string) {
  const from =
    process.env.EMAIL_FROM || "noreply@test-3m5jgromn5xgdpyo.mlsender.net";

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
      <h2>Sign in to MunchAI</h2>
      <p>Click the button below to sign in. This link will expire shortly.</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px;">Sign in</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const params = new EmailParams()
    .setFrom({ email: from })
    .setTo([new Recipient(to)])
    .setReplyTo({ email: from })
    .setSubject("Your MunchAI sign-in link")
    .setHtml(html)
    .setText("Click the link to sign in to MunchAI");

  try {
    const response = await mailerSend.email.send(params);
    console.log("✅ Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

export async function sendVerificationEmail(
  to: string,
  verificationCode: string,
) {
  const from =
    process.env.EMAIL_FROM || "noreply@test-3m5jgromn5xgdpyo.mlsender.net";

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
      <h2>Verify your email</h2>
      <p>Enter the code below to verify your email address:</p>
      <div style="background:#f0f0f0;padding:16px;border-radius:6px;text-align:center;margin:16px 0;">
        <code style="font-size:24px;font-weight:bold;letter-spacing:4px;">${verificationCode}</code>
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const params = new EmailParams()
    .setFrom({ email: from })
    .setTo([new Recipient(to)])
    .setReplyTo({ email: from })
    .setSubject("Verify your MunchAI email")
    .setHtml(html)
    .setText(`Your verification code: ${verificationCode}`);

  try {
    const response = await mailerSend.email.send(params);
    console.log("✅ Verification email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
}
