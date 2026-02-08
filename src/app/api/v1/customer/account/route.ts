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

// Helper to authenticate user
async function authenticate(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
        return null;
    }

    return decoded.id;
}

export async function GET(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const customerId = await authenticate(req);
        if (!customerId) {
            const response = NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        // Get customer account(s)
        // Assuming single account for now based on typical flow, but returning list or primary
        const accounts = await db.account.findMany({
            where: { customerId: Number(customerId) },
            select: {
                id: true,
                account_id: true,
                balance: true,
                profit: true,
                currency: true,
                status: true
            }
        });

        if (!accounts || accounts.length === 0) {
            const response = NextResponse.json({
                success: true,
                data: null,
                message: 'No account found'
            }, { status: 200 });
            return addCorsHeaders(response, req);
        }

        // Return the first account as the primary one for now, or list if multiple intended.
        // User asked for "account info", usually implying the main wallet.
        const account = accounts[0];

        const response = NextResponse.json({
            success: true,
            data: account
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Get account info error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
