import nodemailer from "nodemailer";

// Initialize the SMTP mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
  secure: process.env.SMTP_PORT === "465",
});

/**
 * Sends a premium-styled HTML password reset email to the user.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const domain = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetLink = `${domain}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Ahbar & Co." <no-reply@ahbarandco.com>`,
    to: email,
    subject: "Reset your password — Ahbar & Co.",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FAF9F6; color: #2C2623; border: 1px solid #E8E5DF; border-radius: 2px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #E8E5DF; padding-bottom: 20px;">
          <h2 style="font-size: 24px; font-weight: 300; letter-spacing: 0.1em; color: #2C2623; margin: 0; text-transform: uppercase;">Ahbar & Co.</h2>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #5C524D; margin-bottom: 20px;">
          Hello,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #5C524D; margin-bottom: 30px;">
          We received a request to reset the password for your account. Click the button below to choose a new password:
        </p>
        
        <div style="text-align: center; margin-bottom: 35px;">
          <a href="${resetLink}" target="_blank" style="background-color: #2C2623; color: #FAF9F6; text-decoration: none; padding: 14px 35px; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; display: inline-block; border-radius: 1px; text-transform: uppercase;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 12px; line-height: 1.6; color: #7F736C; margin-bottom: 20px;">
          If the button above does not work, please copy and paste the link below into your browser address bar:
          <br />
          <a href="${resetLink}" target="_blank" style="color: #8C7A6B; text-decoration: underline; word-break: break-all;">${resetLink}</a>
        </p>
        
        <p style="font-size: 12px; line-height: 1.6; color: #7F736C; margin-bottom: 30px; font-style: italic;">
          This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #E8E5DF; margin-bottom: 20px;" />
        
        <div style="text-align: center; font-size: 10px; color: #9E938D; letter-spacing: 0.05em; text-transform: uppercase;">
          Ahbar & Co. — Handcrafted Minimalist Furniture
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
