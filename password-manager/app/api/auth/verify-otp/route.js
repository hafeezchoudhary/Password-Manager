// app/api/verify-otp/route.js
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "@/lib/encryption";
import { createEmailHash } from "@/lib/emailHash";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const otpsCollection = db.collection("otps");
    const usersCollection = db.collection("users");

    // 1️⃣ Check for existing user by emailHash before registering
    const normalizedEmail = email.trim().toLowerCase(); // ✅ normalize email
    const emailHash = createEmailHash(normalizedEmail);
    const existingUser = await usersCollection.findOne({ emailHash });
    if (existingUser) {
      await client.close();
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // 2️⃣ Find OTP entry and decrypt
    const allOtps = await otpsCollection.find({}).toArray();
    let otpEntry = null;
    for (const entry of allOtps) {
      const decryptedEmail = decrypt(entry.email);
      if (decryptedEmail === email) {
        otpEntry = {
          ...entry,
          email: decryptedEmail,
          name: decrypt(entry.name),
          otp: decrypt(entry.otp),
          password: decrypt(entry.password),
          otpExpiry: entry.otpExpiry
        };
        break;
      }
    }

    if (!otpEntry) {
      await client.close();
      return Response.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Compare OTP
    if (otpEntry.otp !== otp) {
      await client.close();
      return Response.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check expiry
    const now = new Date();
    if (now > otpEntry.otpExpiry) {
      await client.close();
      return Response.json({ error: "OTP expired" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(otpEntry.password, 10);

    // Encrypt and save user
    const userDoc = {
      name: encrypt(otpEntry.name),
      email: encrypt(email),
      emailHash, // plain SHA-256 for duplicates check
      password: encrypt(hashedPassword),
      verified: true,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(userDoc);

    // Delete OTP entry after registration
    await otpsCollection.deleteOne({ _id: otpEntry._id });
    await client.close();

    // Return only success message and user ID - no sensitive information
    return Response.json({
      message: "User registered successfully",
      userId: ".",
    });
  } catch (err) {
    // Don't log error details that might contain sensitive information
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}