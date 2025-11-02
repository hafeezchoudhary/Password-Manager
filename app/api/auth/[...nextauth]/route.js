import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import { decrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';
import { createEmailHash } from '@/lib/emailHash';
import { sendLoginAlert } from '@/lib/send-login-alert';

export const runtime = "nodejs"; 

// ------------------------
// MongoDB Connection (works in local & Vercel)
// ------------------------
let cachedClient = global.mongoClient;
let cachedDb = global.mongoDb;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return cachedDb;

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(); // uses database name from URI
  cachedClient = client;
  cachedDb = db;
  global.mongoClient = client;
  global.mongoDb = db;

  return db;
}

// ------------------------
// NextAuth Config
// ------------------------
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;

          if (!email || !password)
            throw new Error('Email and password are required');

          const db = await connectToDatabase();

          // 1️⃣ Generate emailHash from login email
          const emailHash = createEmailHash(email);

          // 2️⃣ Find user by emailHash
          const user = await db.collection('users').findOne({ emailHash });

          if (!user) throw new Error('Invalid email or password');

          // 3️⃣ Password comparison
          const storedPassword = user.password.startsWith('$2')
            ? user.password
            : decrypt(user.password);
          const isMatch = await bcrypt.compare(password, storedPassword);

          if (!isMatch) throw new Error('Invalid email or password');

          // ✅ Send login alert asynchronously (non-blocking)
          try {
            sendLoginAlert(decrypt(user.email)).catch((err) =>
              console.error("Login alert error:", err)
            );
          } catch (e) {
            console.error("Login alert async error:", e);
          }


          // 4️⃣ Return decrypted user for session
          return {
            id: user._id.toString(),
            name: decrypt(user.name),
            email: decrypt(user.email),
          };
        } catch (err) {
          console.error('Authorize error:', err);
          throw new Error(err.message);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },
  jwt: { maxAge: 15 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      if (token.user) session.user = token.user;
      return session;
    },
  },
  pages: { signIn: '/login' },
  debug: false,
};

// ------------------------
// Export handler
// ------------------------
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };