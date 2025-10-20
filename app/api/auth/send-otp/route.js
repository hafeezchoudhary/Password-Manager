// app/api/auth/send-otp/route.js
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import { encrypt } from "@/lib/encryption";
import { createEmailHash } from "@/lib/emailHash";

export const POST = async (req) => {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Email, name, and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailHash = createEmailHash(normalizedEmail);

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection("users");
    const otpsCollection = db.collection("otps");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ emailHash });
    if (existingUser) {
      await client.close();
      return new Response(
        JSON.stringify({ success: false, message: "User already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

    // Remove existing OTP for same emailHash
    await otpsCollection.deleteMany({ emailHash });

    // Insert encrypted OTP document
    const otpDoc = {
      email: encrypt(email),
      emailHash,           // deterministic for lookup
      otp: encrypt(otp),
      name: encrypt(name),
      password: encrypt(password),
      createdAt: new Date(),
      otpExpiry
    };
    await otpsCollection.insertOne(otpDoc);
    await client.close();

    // Email configuration
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured properly" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      requireTLS: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
  from: `"Secure Vault" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your One-Time Password (OTP) - Secure Vault",
  text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333;">Secure Vault</h2>
      <p>Hi,</p>
      <p>Your <strong>One-Time Password (OTP)</strong> is:</p>
      <h1 style="color: #1a73e8; letter-spacing: 4px;">${otp}</h1>
      <p>This OTP will expire in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr style="border:none; border-top:1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">
        Secure Vault Inc.<br/>
        Need help? Contact <a href="mailto:SecureVault.pass@gmail.com">SecureVault.pass@gmail.com</a>
      </p>
      <span style="display:none;">${Date.now()}</span>
    </div>
  `
});


    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send OTP error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
