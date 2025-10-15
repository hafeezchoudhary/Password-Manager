import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { decrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';
import { createEmailHash } from '@/lib/emailHash';
import nodemailer from 'nodemailer'; // ✅ Added for login alert

// Helper function to send login alert email
async function sendLoginAlert(email, ipAddress = 'Unknown') {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New Login Alert 🚨',
      html: `
        <p>Hello,</p>
        <p>We noticed a new login to your account.</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p>If this was you, no action is needed. If not, please change your password immediately.</p>
        <p>Stay safe,<br/>Your App Team</p>
      `,
    });

    console.log(`Login alert sent to ${email}`);
  } catch (err) {
    console.error('Error sending login alert:', err);
  }
}

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
        const userIp = credentials.ip || 'Unknown'; // optional: pass IP from frontend
        sendLoginAlert(decrypt(user.email), userIp);

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
