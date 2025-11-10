import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import { decrypt, encrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';
import { createEmailHash } from '@/lib/emailHash';
import { sendLoginAlert } from '@/lib/send-login-alert';
import GoogleProvider from 'next-auth/providers/google'

export const runtime = "nodejs";

let cachedClient = global.mongoClient;
let cachedDb = global.mongoDb;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return cachedDb;

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  cachedClient = client;
  cachedDb = db;
  global.mongoClient = client;
  global.mongoDb = db;

  return db;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;
          if (!email || !password) throw new Error('Email and password are required');

          const db = await connectToDatabase();
          const emailHash = createEmailHash(email);
          const user = await db.collection('users').findOne({ emailHash });
          if (!user) throw new Error('Invalid email or password');

          const storedPassword = user.password.startsWith('$2')
            ? user.password
            : decrypt(user.password);
          const isMatch = await bcrypt.compare(password, storedPassword);
          if (!isMatch) throw new Error('Invalid email or password');

          try {
            sendLoginAlert(decrypt(user.email)).catch((err) =>
              console.error("Login alert error:", err)
            );
          } catch (e) { console.error("Login alert async error:", e); }

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
    // 📌 ADD THIS
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const db = await connectToDatabase();
        const emailHash = createEmailHash(user.email);
        let exist = await db.collection('users').findOne({ emailHash });

        if (!exist) {
          const result = await db.collection('users').insertOne({
            name: encrypt(user.name),
            email: encrypt(user.email),
            emailHash,
            password: null,
            provider: "google"
          });

          // very IMPORTANT fix: attach mongodb _id to user object so session uses same ID
          user.id = result.insertedId.toString();
        } else {
          // important for existing google users also
          user.id = exist._id.toString();
        }
      }
      return true;
    },

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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
