// app/api/register/route.js
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/encryption';
import { createEmailHash } from '@/lib/emailHash';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectToDatabase();

    // 1️⃣ Normalize email and create deterministic SHA-256 emailHash
    const normalizedEmail = email.trim().toLowerCase();
    const emailHash = createEmailHash(normalizedEmail);

    // 2️⃣ Check if a user already exists with the same emailHash
    const existingUser = await db.collection('users').findOne({ emailHash });
    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Insert new user with encrypted fields (keep same flow)
    const result = await db.collection('users').insertOne({
      name: encrypt(name),
      email: encrypt(normalizedEmail),
      emailHash, // store plain SHA-256 for duplicate checking
      password: encrypt(hashedPassword),
      verified: true,
      createdAt: new Date(),
    });

    return Response.json({ message: 'User registered securely' }, { status: 201 });

  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}