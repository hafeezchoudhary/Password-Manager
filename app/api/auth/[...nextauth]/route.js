import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { decrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';
import { createEmailHash } from '@/lib/emailHash';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        if (!email || !password) throw new Error('Email and password are required');

        const db = await connectToDatabase();

        // 1️⃣ Generate emailHash from login email (same as registration)
        const emailHash = createEmailHash(email);

        // 2️⃣ Find user by emailHash directly (no decryption)
        const user = await db.collection('users').findOne({ emailHash });

        if (!user) throw new Error('Invalid email or password');

        // 3️⃣ Fixed password comparison:
        // If password starts with "$2", it's a bcrypt hash already (reset password)
        const storedPassword = user.password.startsWith('$2') ? user.password : decrypt(user.password);
        const isMatch = await bcrypt.compare(password, storedPassword);

        if (!isMatch) throw new Error('Invalid email or password');

        // ✅ Send login alert AFTER successful login (non-blocking)
        fetch(`${process.env.NEXTAUTH_URL || ''}/api/auth/send-login-alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: decrypt(user.email) }),
        }).catch(err => console.error("Login alert error:", err));

        // 4️⃣ Return decrypted user for session
        return {
          id: user._id.toString(),
          name: decrypt(user.name),
          email: decrypt(user.email),
        };
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };