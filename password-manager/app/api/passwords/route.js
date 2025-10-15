// app/api/passwords/route.js
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { encrypt, decrypt } from '@/lib/encryption';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const db = await connectToDatabase();
        
        // Convert user ID to ObjectId if it's a string
        const userId = typeof session.user.id === 'string' ? new ObjectId(session.user.id) : session.user.id;
        
        const passwords = await db.collection('passwords')
            .find({ userId })
            .toArray();
        
        // Decrypt all sensitive fields
        const decryptedPasswords = passwords.map(pwd => {
            return {
                _id: pwd._id,
                userId: pwd.userId,
                website: decrypt(pwd.website),
                username: decrypt(pwd.username),
                password: decrypt(pwd.password),
                notes: decrypt(pwd.notes),
                createdAt: pwd.createdAt
            };
        });

        return Response.json(decryptedPasswords);
    } catch (error) {
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { website, username, password, notes } = await request.json();
        
        if (!website || !username || !password) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const db = await connectToDatabase();
        
        // Convert user ID to ObjectId if it's a string
        const userId = typeof session.user.id === 'string' ? new ObjectId(session.user.id) : session.user.id;
        
        const result = await db.collection('passwords').insertOne({
            userId,
            website: encrypt(website),
            username: encrypt(username),
            password: encrypt(password),
            notes: encrypt(notes || ''),
            createdAt: new Date()
        });
        
        return Response.json({ 
            message: 'Password added successfully', 
            passwordId: result.insertedId 
        });
    } catch (error) {
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}