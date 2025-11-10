import nodemailer from 'nodemailer';

// ✅ function name must match exactly what you call in nextauth
export async function sendLoginAlert(email, clientIp = null) {
  try {

    if (!email) return;

    let ipAddress = clientIp ||
      "Unknown";

    if (ipAddress === "::1" || ipAddress === "127.0.0.1") ipAddress = "Localhost";

    // mock location in localhost dev for testing
    // if (process.env.NODE_ENV !== "production" && ipAddress === "Localhost") {
    //   ipAddress = "103.159.220.50";
    // }

    let locationInfo = { city: "Unknown", regionName: "", country: "" };

    if (ipAddress !== "Unknown" && ipAddress !== "Localhost") {
      try {
        const resGeo = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const data = await resGeo.json();
        if (data.status === "success") {
          locationInfo = {
            city: data.city || "Unknown",
            regionName: data.regionName || "",
            country: data.country || "",
          };
        }
      } catch (err) {
        console.error("GeoIP lookup failed:", err);
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT == "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SecurePass Vault Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New Login Detected - SecurePass Vault Security Alert",
      html: `
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /></head>
  <body style="background:#f4f7fa;font-family:sans-serif;margin:0;padding:0">
    <div style="max-width:550px;margin:40px auto;background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,.08)">
      <div style="background:linear-gradient(135deg,#007bff,#00bfff);color:#fff;text-align:center;padding:20px 0">
        <h1 style="margin:0;font-size:22px">SecurePass Vault Security Alert</h1>
      </div>
      <div style="padding:25px 30px;color:#333;font-size:15px;line-height:1.7">
        <p>Hello,</p>
        <p>We detected a new login to your <b>SecurePass Vault</b> account.</p>
        <div style="background:#f8faff;border:1px solid #e0ebff;border-radius:6px;padding:12px 15px;margin-top:15px">
          <p><strong>IP Address:</strong> ${ipAddress}</p>
          <p><strong>Location:</strong> ${locationInfo.city}, ${locationInfo.regionName}, ${locationInfo.country}</p>
        </div>
        <p>If this was you, you can safely ignore this message.</p>
        <p>If not, please <strong>change your password immediately</strong>.</p>
        <p>Stay secure,<br><b>The SecurePass Vault Security Team</b></p>
      </div>
      <div style="background:#f1f5f9;color:#666;text-align:center;font-size:13px;padding:15px;border-top:1px solid #e3e8ef">
        <p>© ${new Date().getFullYear()} SecurePass Vault. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`
    });
  } catch (err) {
    console.error("❌ sendLoginAlert error:", err);
  }
}
