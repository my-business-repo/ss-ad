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

        const addresses = await db.withdrawalAddress.findMany({
            where: { customerId: Number(customerId) },
            orderBy: { createdAt: 'desc' }
        });

        const response = NextResponse.json({
            success: true,
            data: addresses
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Get withdrawal addresses error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}

export async function POST(req: Request) {
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

        const body = await req.json();
        const {
            type,
            network,
            address,
            bankName,
            accountName,
            details
        } = body;

        // Basic validation
        if (!type || !address) {
            const response = NextResponse.json(
                { error: 'Type and address are required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // Specific validation based on type
        if (type === 'CRYPTO' && !network) {
            const response = NextResponse.json(
                { error: 'Network is required for crypto withdrawals' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        if (type === 'BANK' && (!bankName || !accountName)) {
            const response = NextResponse.json(
                { error: 'Bank name and account name are required for bank withdrawals' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        const newAddress = await db.withdrawalAddress.create({
            data: {
                customerId: Number(customerId),
                type,
                network,
                address,
                bankName,
                accountName,
                details,
                status: 'active'
            }
        });

        const response = NextResponse.json({
            success: true,
            message: 'Withdrawal address added successfully',
            data: newAddress
        }, { status: 201 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Add withdrawal address error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
