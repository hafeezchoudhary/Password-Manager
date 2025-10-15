// // models/Otp.js
// import mongoose from 'mongoose';

// const otpSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   otp: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   otpExpiry: {
//     type: Date,
//     required: true
//   }
// });

// // Add a pre-save hook to log when an OTP is saved
// // otpSchema.pre('save', function(next) {
// //   console.log('Saving OTP:', {
// //     email: this.email,
// //     otp: this.otp,
// //     expiresAt: this.otpExpiry,
// //     hasPassword: !!this.password,
// //     passwordLength: this.password ? this.password.length : 0
// //   });
// //   next();
// // });

// export default mongoose.models.Otp || mongoose.model('Otp', otpSchema);