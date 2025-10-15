// // app/api/auth/validate/route.js
// import { getServerSession } from "next-auth";
// import { authOptions } from '../auth/[...nextauth]/route';

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session) {
//       return Response.json({ valid: false }, { status: 401 });
//     }
    
//     // Here you can add additional validation if needed
//     // For example, check if the user still exists in the database
    
//     return Response.json({ valid: true });
//   } catch (error) {
//     console.error("Session validation error:", error);
//     return Response.json({ valid: false }, { status: 500 });
//   }
// }