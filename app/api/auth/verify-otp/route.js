// app/api/auth/verify-otp/route.js
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "@/lib/encryption";
import { createEmailHash } from "@/lib/emailHash";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ success: false, message: "Email and OTP are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailHash = createEmailHash(normalizedEmail);

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const otpsCollection = db.collection("otps");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ emailHash });
    if (existingUser) {
      await client.close();
      return new Response(
        JSON.stringify({ success: false, message: "User already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find OTP entry by emailHash
    const otpEntryRaw = await otpsCollection.findOne({ emailHash });

    if (!otpEntryRaw) {
      await client.close();
      return new Response(
        JSON.stringify({ success: false, message: "Invalid OTP" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Decrypt fields
    const otpEntry = {
      ...otpEntryRaw,
      email: decrypt(otpEntryRaw.email),
      name: decrypt(otpEntryRaw.name),
      password: decrypt(otpEntryRaw.password),
      otp: decrypt(otpEntryRaw.otp),
      otpExpiry: otpEntryRaw.otpExpiry,
    };

    // Compare OTP
    if (otpEntry.otp.trim() !== otp.trim()) {
      await client.close();
      return new Response(
        JSON.stringify({ success: false, message: "Invalid OTP" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date() > otpEntry.otpExpiry) {
      await client.close();
      return new Response(
        JSON.stringify({ success: false, message: "OTP expired" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(otpEntry.password, 10);

    // Save user
    const userDoc = {
      name: encrypt(otpEntry.name),
      email: encrypt(normalizedEmail),
      emailHash,
      password: encrypt(hashedPassword),
      verified: true,
      createdAt: new Date(),
    };
    await usersCollection.insertOne(userDoc);

    // Cleanup OTP
    await otpsCollection.deleteOne({ _id: otpEntry._id });
    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "User registered successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Verify OTP error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}