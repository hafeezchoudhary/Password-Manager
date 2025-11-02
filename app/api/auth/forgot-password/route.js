
import { connectToDatabase } from '@/lib/mongodb';
import { createEmailHash, sendPasswordResetEmail } from '@/lib/emailHash';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    const db = await connectToDatabase();
    const emailHash = createEmailHash(email);
    const user = await db.collection('users').findOne({ emailHash });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { resetToken: token, resetTokenExpiry: expiry } }
      );

      sendPasswordResetEmail(email, token).catch(console.error);
    }

    return new Response(JSON.stringify({
      message: 'If an account with that email exists, a password reset link has been sent.'
    }), { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), { status: 500 });
  }
}
