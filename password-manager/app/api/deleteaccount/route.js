import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { decrypt } from "@/lib/encryption";
import { ObjectId } from "mongodb";

/**
 * DELETE /api/deleteAccount
 * Deletes the currently logged-in user account (based on session)
 */
export async function DELETE() {
  try {
    // Get active session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Find the user by decrypting email fields in all documents
    const allUsers = await db.collection("users").find({}).toArray();
    let userToDelete = null;
    
    for (const user of allUsers) {
      try {
        const decryptedEmail = decrypt(user.email);
        if (decryptedEmail === session.user.email) {
          userToDelete = user;
          break;
        }
      } catch (e) {
        console.log("Error decrypting email:", e.message);
      }
    }

    if (!userToDelete) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    console.log("Found user to delete:", userToDelete._id);

    // Delete the user document
    await db.collection("users").deleteOne({ _id: userToDelete._id });

    // Optionally: delete related passwords (if you store by userId)
    await db.collection("passwords").deleteMany({ userId: userToDelete._id });

    return new Response(
      JSON.stringify({ message: "Account and related data deleted successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Delete Account Error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}