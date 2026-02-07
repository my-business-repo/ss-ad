import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { handleCors, addCorsHeaders } from '@/lib/cors';

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

export async function POST(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Extract token from Authorization header
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token (returns null if invalid or expired)
        const decoded = verifyToken(token);

        if (!decoded) {
            const response = NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        // Get customer from database
        const customer = await db.customer.findUnique({
            where: { id: decoded.id },
            include: {
                level: true, // Include level info
            },
        });

        if (!customer) {
            const response = NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        // Return customer information
        const response = NextResponse.json({
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                level: customer.level,
            },
        });
        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Token verification error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
