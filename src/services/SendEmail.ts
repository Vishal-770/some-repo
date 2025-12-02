import { transporter } from "./mailer";

export async function sendEmailVerification(
  email: string,
  username: string,
  verificationLink: string
) {
  const htmlContent = `
    <div style="font-family: Arial; padding: 12px;">
      <h2>Hello, ${username} 👋</h2>
      <p>Thank you for signing up! Please verify your email by clicking:</p>
      <a href="${verificationLink}"
         style="padding: 10px 18px; background: #4CAF50; color: white;
                border-radius: 6px; text-decoration:none;">
         Verify Email
      </a>

      <p style="margin-top:20px;">If you did not request this, ignore this mail.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"My App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verify your email address",
    html: htmlContent,
  });
}
