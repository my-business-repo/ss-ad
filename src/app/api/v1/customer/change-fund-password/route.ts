import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hashPassword, verifyPassword } from '@/lib/password';
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
        const { oldFundPassword, newFundPassword } = body;

        // Validation
        if (!newFundPassword) {
            const response = NextResponse.json(
                { error: 'New fund password is required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        if (newFundPassword.length < 6) {
            const response = NextResponse.json(
                { error: 'New fund password must be at least 6 characters long' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // Fetch customer with current fund password
        const customer = await db.customer.findUnique({
            where: { id: Number(customerId) }
        });

        if (!customer) {
            const response = NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, req);
        }

        // Check if customer already has a fund password
        if (customer.fundPassword) {
            if (!oldFundPassword) {
                const response = NextResponse.json(
                    { error: 'Old fund password is required' },
                    { status: 400 }
                );
                return addCorsHeaders(response, req);
            }

            // Verify old fund password
            const isValid = await verifyPassword(oldFundPassword, customer.fundPassword);
            if (!isValid) {
                const response = NextResponse.json(
                    { error: 'Incorrect old fund password' },
                    { status: 400 }
                );
                return addCorsHeaders(response, req);
            }
        }
        // If no fund password exists, we don't need oldFundPassword - this acts as setting it for the first time.

        // Hash new fund password and update
        const hashedNewFundPassword = await hashPassword(newFundPassword);

        await db.customer.update({
            where: { id: Number(customerId) },
            data: { fundPassword: hashedNewFundPassword }
        });

        const response = NextResponse.json({
            success: true,
            message: 'Fund password updated successfully'
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Change fund password error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
