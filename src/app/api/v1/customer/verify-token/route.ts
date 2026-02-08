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
                accounts: true, // Include accounts
            },
        });

        if (!customer) {
            const response = NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        const account = customer.accounts[0];

        // Return customer information
        const response = NextResponse.json({
            customer: {
                id: customer.id,
                user_id: customer.user_id,
                name: customer.name,
                email: customer.email,
                referCode: customer.referCode,
                level: customer.level,
            },
            account: account ? {
                id: account.id,
                account_id: account.account_id,
                balance: account.balance,
                profit: account.profit,
                currency: account.currency,
                status: account.status,
            } : null,
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
