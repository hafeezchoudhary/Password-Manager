import nodemailer from 'nodemailer';
import fetch from 'node-fetch'; // for GeoIP lookup

export async function sendLoginAlert(email, ipAddress = 'Unknown') {
  try {
    // Get location info from IP
    let locationInfo = { city: 'Unknown', regionName: '', country: '' };
    if (ipAddress !== 'Unknown') {
      try {
        const res = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const data = await res.json();
        locationInfo = {
          city: data.city || 'Unknown',
          regionName: data.regionName || '',
          country: data.country || '',
        };
      } catch (err) {
        console.error('GeoIP lookup failed:', err);
      }
    }

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
      from: `"Cipher Lock" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New Login Alert 🚨',
      html: `
        <p>Hello,</p>
        <p>We noticed a new login to your account.</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p><strong>Location:</strong> ${locationInfo.city}, ${locationInfo.regionName}, ${locationInfo.country}</p>
        <p>If this was you, no action is needed. If not, please change your password immediately.</p>
        <p>Stay safe,<br/>Cipher Lock Team</p>
        <span style="display:none;">${Date.now()}</span> <!-- prevents pink quoted text -->
      `,
    });
  } catch (err) {
    console.error('Error sending login alert:', err);
  }
}
