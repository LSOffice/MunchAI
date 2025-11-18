// import nodemailer from "nodemailer";

// export function createTransport() {
//   const host = process.env.SMTP_HOST;
//   const port = Number(process.env.SMTP_PORT || 587);
//   const user = process.env.SMTP_USER;
//   const pass = process.env.SMTP_PASS;

//   if (!host || !user || !pass) {
//     throw new Error(
//       "SMTP credentials are not configured (SMTP_HOST/USER/PASS)",
//     );
//   }

//   return nodemailer.createTransport({
//     host,
//     port,
//     secure: port === 465,
//     auth: { user, pass },
//   });
// }

// export async function sendMagicLinkEmail(to: string, url: string) {
//   const transporter = createTransport();
//   const from = process.env.EMAIL_FROM || "no-reply@munchai.local";

//   const html = `
//     <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
//       <h2>Sign in to MunchAI</h2>
//       <p>Click the button below to sign in. This link will expire shortly.</p>
//       <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px;">Sign in</a></p>
//       <p>Or copy and paste this URL into your browser:</p>
//       <p><a href="${url}">${url}</a></p>
//       <p>If you did not request this, you can safely ignore this email.</p>
//     </div>
//   `;

//   await transporter.sendMail({
//     from,
//     to,
//     subject: "Your MunchAI sign-in link",
//     html,
//   });
// }

// Console simulation for development
export async function sendMagicLinkEmail(to: string, url: string) {
  const from = process.env.EMAIL_FROM || "no-reply@munchai.local";

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

  console.log("\n📧 [SIMULATED EMAIL]");
  console.log(`From: ${from}`);
  console.log(`To: ${to}`);
  console.log(`Subject: Your MunchAI sign-in link`);
  console.log("\nHTML Content:");
  console.log(html);
  console.log("-------------------\n");
}
