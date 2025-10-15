import mongoose from 'mongoose';
import { encrypt, decrypt } from '../lib/encryption';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    set: encrypt,
    get: decrypt
  },
  email: { 
    type: String, 
    required: true, 
    unique: true
  },
  emailHash: {
    type: String,
    required: true,
    unique: true
  },
  password: { 
    type: String, 
    required: true,
    set: encrypt,
    get: decrypt
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  },
  otp: { type: String, default: null },        // ✅ OTP code
  otpExpiry: { type: Date, default: null },    // ✅ OTP expiry
  isVerified: { type: Boolean, default: false }, // ✅ User verified
  createdAt: { type: Date, default: Date.now }
},
  {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Static method to create email hash
UserSchema.statics.createEmailHash = function(email) {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
};

// Pre-save hook to create email hash
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.emailHash = this.constructor.createEmailHash(this.email);
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);