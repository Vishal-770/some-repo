import { transporter } from "./mailer";

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetLink: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Password Reset Request 🔐</h2>
      <p>Hello ${username || "there"},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}"
           style="padding: 12px 24px; background: #3b82f6; color: white;
                  border-radius: 8px; text-decoration: none; font-weight: 600;
                  display: inline-block;">
           Reset Password
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour for security reasons.
      </p>
      
      <p style="color: #666; font-size: 14px;">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      
      <p style="color: #999; font-size: 12px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetLink}" style="color: #3b82f6;">${resetLink}</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"My App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: htmlContent,
  });
}
