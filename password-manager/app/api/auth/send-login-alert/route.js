import nodemailer from 'nodemailer';

export async function sendLoginAlert(email, ipAddress = 'Unknown') {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New Login Alert 🚨',
      html: `
        <p>Hello,</p>
        <p>We noticed a new login to your account.</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p>If this was you, no action is needed. If not, please change your password immediately.</p>
        <p>Stay safe,<br/>Your App Team</p>
      `,
    });

    console.log(`Login alert sent to ${email}`);
  } catch (err) {
    console.error('Error sending login alert:', err);
  }
}
