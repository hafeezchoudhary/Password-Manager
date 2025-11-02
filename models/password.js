import mongoose from "mongoose";

const PasswordSchema = new mongoose.Schema({
  website: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  sharedWithEmail: { type: String, default: "" },
  breachStatus: { type: String, default: "unknown" }, // safe | breached | unknown
});

export default mongoose.models.Password ||
  mongoose.model("Password", PasswordSchema);
