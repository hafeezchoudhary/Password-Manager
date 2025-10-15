import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { encrypt } from '@/lib/encryption';
import { ObjectId } from 'mongodb';

export async function PUT(request, { params }) {
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
        
        // Convert string IDs to ObjectId
        const objectId = new ObjectId(params.id);
        const userId = typeof session.user.id === 'string'
            ? new ObjectId(session.user.id)
            : session.user.id;
        
        // Encrypt all sensitive fields before updating
        const result = await db.collection('passwords').updateOne(
            { _id: objectId, userId: userId },
            {
                $set: {
                    website: encrypt(website),
                    username: encrypt(username),
                    password: encrypt(password),
                    notes: encrypt(notes || ''),
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return Response.json({ error: 'Password not found' }, { status: 404 });
        }
        
        return Response.json({ 
            message: 'Password updated successfully'
        });
    } catch (error) {
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Check if the ID is a valid ObjectId
        if (!ObjectId.isValid(params.id)) {
            return Response.json({ error: 'Invalid password ID' }, { status: 400 });
        }
        
        const db = await connectToDatabase();
        
        // Convert string IDs to ObjectId
        const objectId = new ObjectId(params.id);
        const userId = typeof session.user.id === 'string'
            ? new ObjectId(session.user.id)
            : session.user.id;
        
        // First, check if the password exists and belongs to the user
        const password = await db.collection('passwords').findOne({
            _id: objectId,
            userId: userId
        });
        
        if (!password) {
            return Response.json({ error: 'Password not found' }, { status: 404 });
        }
        
        // Delete the password document
        const result = await db.collection('passwords').deleteOne({
            _id: objectId,
            userId: userId
        });
        
        if (result.deletedCount === 0) {
            return Response.json({ error: 'Failed to delete password' }, { status: 500 });
        }

        return Response.json({ 
            message: 'Password deleted successfully'
        });
    } catch (error) {
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }  
}
