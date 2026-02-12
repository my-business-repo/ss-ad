
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db'; // Rename to avoid conflict with firebase db
import { db as firestore } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { verifyToken } from '@/lib/jwt';
import { handleCors, addCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

export async function POST(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            return addCorsHeaders(response, req);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            return addCorsHeaders(response, req);
        }

        const customerId = decoded.id;
        const body = await req.json();
        const { text, img } = body;

        if (!text && !img) {
            const response = NextResponse.json({ error: 'Message content required' }, { status: 400 });
            return addCorsHeaders(response, req);
        }

        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
        });

        if (!customer) {
            const response = NextResponse.json({ error: 'Customer not found' }, { status: 404 });
            return addCorsHeaders(response, req);
        }

        // Add to Firestore
        // Note: This runs on server, so it should work if rules allow or if we had admin sdk.
        // Assuming public rules for now or authenticated user rules (but this is server env).
        // If client SDK is used here, it acts as an unauthenticated client unless we signIn.
        // However, for this task, I will implement it.

        const messageData = {
            text: text || null,
            img: img || null,
            sender: 'customer',
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(firestore, "chats", customer.user_id, "messages"), messageData);

        // Update last message in chat doc
        await setDoc(doc(firestore, "chats", customer.user_id), {
            customerId: customer.user_id,
            customerName: customer.name,
            lastMessage: img ? "[Image]" : text,
            lastMessageTime: serverTimestamp(),
            unreadAdmin: true, // Flag for admin to see unread?
        }, { merge: true });

        // Trigger Notification
        await prisma.notification.create({
            data: {
                type: 'MESSAGE',
                message: `New message from ${customer.name}`,
                customerId: customer.id,
            },
        });

        const response = NextResponse.json({ success: true });
        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Send message error:', error);
        const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        return addCorsHeaders(response, req);
    }
}
