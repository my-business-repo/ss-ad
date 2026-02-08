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
        const { oldPassword, newPassword } = body;

        // Validation
        if (!oldPassword || !newPassword) {
            const response = NextResponse.json(
                { error: 'Old password and new password are required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        if (newPassword.length < 6) {
            const response = NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // Fetch customer with current password
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

        // Verify old password
        const isValid = await verifyPassword(oldPassword, customer.password);
        if (!isValid) {
            const response = NextResponse.json(
                { error: 'Incorrect old password' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // Hash new password and update
        const hashedNewPassword = await hashPassword(newPassword);

        await db.customer.update({
            where: { id: Number(customerId) },
            data: { password: hashedNewPassword }
        });

        const response = NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Change password error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
