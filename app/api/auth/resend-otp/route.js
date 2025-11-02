// resend-otp/route.js
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import { encrypt } from "@/lib/encryption";
import { createEmailHash } from "@/lib/emailHash";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const encryptedEmail = createEmailHash(normalizedEmail);
    // const encryptedEmail = encrypt(normalizedEmail);

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const otpsCollection = db.collection("otps");

    // Check for existing OTP
    const existingOtpDoc = await otpsCollection.findOne({ email: encryptedEmail });

    // If no existing OTP, user needs to register first
    if (!existingOtpDoc) {
      await client.close();
      return new Response(
        JSON.stringify({ success: false, message: "No registration attempt found. Please register first." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate-limiting: 30 seconds between resends
    const now = new Date();
    const timeSinceLastOtp = now - existingOtpDoc.createdAt;
    if (timeSinceLastOtp < 30000) {
      await client.close();
      const remainingTime = Math.ceil((30000 - timeSinceLastOtp) / 1000);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Please wait ${remainingTime} seconds before requesting another OTP` 
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Update existing OTP with new values
    await otpsCollection.updateOne(
      { email: encryptedEmail },
      { 
        $set: { 
          otp: encrypt(otp), 
          createdAt: new Date(), 
          otpExpiry 
        }
      }
    );

    await client.close();

    // Email configuration check
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || 
        !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send email with new OTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Password Manager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your New OTP Code",
      text: `Your new OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "New OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Resend OTP error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};