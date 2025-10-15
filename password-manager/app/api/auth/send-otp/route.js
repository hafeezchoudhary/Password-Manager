// app/api/auth/send-otp/route.js
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import { encrypt } from "@/lib/encryption"; // ✅ Import your encryption utility
import { createEmailHash } from "@/lib/emailHash"; // ✅ Import email hash function

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email, name, and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Normalize email and create hash for duplicate check
    const normalizedEmail = email.trim().toLowerCase();
    const emailHash = createEmailHash(normalizedEmail);

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection("users");

    // ✅ Check if user already exists
    const existingUser = await usersCollection.findOne({ emailHash });
    if (existingUser) {
      await client.close();
      return new Response(
        JSON.stringify({
          success: false,
          message: "User already exists",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

    const otpsCollection = db.collection("otps");

    // Remove existing OTP for same email
    await otpsCollection.deleteMany({ email: encrypt(email) });

    // ✅ Encrypt all sensitive data before inserting
    const encryptedOtpDoc = {
      email: encrypt(email),
      otp: encrypt(otp),
      name: encrypt(name),
      password: encrypt(password),
      createdAt: new Date(),
      otpExpiry,
    };

    await otpsCollection.insertOne(encryptedOtpDoc);

    await client.close();

    // Check email environment
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email service not configured properly",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create transporter
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

    // Send OTP email (don't encrypt this part)
    await transporter.sendMail({
  from: `"CipherLock" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your One-Time Password (OTP) - CipherLock",
  text: `Your OTP is ${otp}. It will expire in 5 minutes.`, // fallback for plain text
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333;">CipherLock</h2>
      <p>Hi,</p>
      <p>Your <strong>One-Time Password (OTP)</strong> is:</p>
      <h1 style="color: #1a73e8; letter-spacing: 4px;">${otp}</h1>
      <p>This OTP will expire in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr style="border:none; border-top:1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">CipherLock Inc.<br/>Need help? Contact <a href="mailto:support@passwordmanager.com">support@passwordmanager.com</a></p>
    </div>
  `
});


    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};