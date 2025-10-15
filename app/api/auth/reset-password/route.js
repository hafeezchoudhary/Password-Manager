// app/api/auth/reset-password/route.js
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return new Response(JSON.stringify({ message: 'Token and new password are required' }), { status: 400 });
    }

    const db = await connectToDatabase();

    // Find user with valid reset token
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid or expired token' }), { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null 
        }
      }
    );

    return new Response(JSON.stringify({ message: 'Password has been reset successfully' }), { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), { status: 500 });
  }
}
