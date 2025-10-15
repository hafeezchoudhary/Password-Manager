// import { MongoClient } from "mongodb";
// import nodemailer from "nodemailer";
// import { encrypt } from "@/lib/encryption";

// export const POST = async (req) => {
//   try {
//     const body = await req.json();
//     const { email } = body;

//     if (!email) {
//       return new Response(
//         JSON.stringify({ success: false, message: "Email is required" }),
//         { status: 400, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     const normalizedEmail = email.trim().toLowerCase();
//     const encryptedEmail = encrypt(normalizedEmail);

//     const client = new MongoClient(process.env.MONGODB_URI);
//     await client.connect();
//     const db = client.db();
//     const otpsCollection = db.collection("otps");

//     // Check for existing OTP
//     const existingOtpDoc = await otpsCollection.findOne({ email: encryptedEmail });

//     // If no existing OTP, return error (user needs to register first)
//     if (!existingOtpDoc) {
//       await client.close();
//       return new Response(
//         JSON.stringify({ success: false, message: "No registration attempt found. Please register first." }),
//         { status: 404, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Rate-limit: 30 seconds
//     const now = new Date();
//     if (now - existingOtpDoc.createdAt < 30000) {
//       await client.close();
//       return new Response(
//         JSON.stringify({ success: false, message: "Wait 30 seconds before resending OTP" }),
//         { status: 429, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Generate new OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

//     // Update existing OTP
//     await otpsCollection.updateOne(
//       { email: encryptedEmail },
//       { 
//         $set: { 
//           otp: encrypt(otp), 
//           createdAt: new Date(), 
//           otpExpiry 
//         }
//       }
//     );

//     await client.close();

//     // Email sending code (unchanged)
//     if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//       return new Response(
//         JSON.stringify({ success: false, message: "Email service not configured" }),
//         { status: 500, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: parseInt(process.env.EMAIL_PORT),
//       secure: false,
//       requireTLS: true,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Password Manager" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your New OTP Code",
//       text: `Your new OTP is ${otp}. It will expire in 5 minutes.`,
//     });

//     return new Response(
//       JSON.stringify({ success: true, message: "New OTP sent successfully" }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );

//   } catch (error) {
//     console.error("Resend OTP error:", error);
//     return new Response(
//       JSON.stringify({ success: false, message: "An unexpected error occurred" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// };