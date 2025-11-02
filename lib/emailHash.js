import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ✅ Generate HMAC-based SHA-256 hash for email
export function createEmailHash(email) {
  const normalizedEmail = email.toLowerCase();
  const secretKey = process.env.HASH_SECRET || 'fallback-secret-key';

  return crypto
    .createHmac('sha256', secretKey)
    .update(normalizedEmail)
    .digest('hex');
}

// ✅ Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // true if port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SecurePass Vault" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>You requested to reset your password.</p>
          <p>Click the button below to reset it:</p>
          <a href="${resetUrl}"
            style="display:inline-block; background-color:#4F46E5; color:#fff;
                   padding:10px 20px; text-decoration:none; border-radius:5px;">
            Reset Password
          </a>
          <p style="margin-top:15px;">This link will expire in 1 hour.</p>
          <p>If you didn’t request this, you can ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
  } catch (err) {
    console.error('❌ Error sending reset email:', err);
    throw new Error('Email sending failed');
  }
};
