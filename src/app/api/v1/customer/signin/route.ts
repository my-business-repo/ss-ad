import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';
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
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            const response = NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        const customer = await db.customer.findUnique({
            where: { email },
            include: {
                level: true, // Include level info
            },
        });

        if (!customer) {
            const response = NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }


        const isValid = await verifyPassword(password, customer.password);

        if (!isValid) {
            const response = NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        if (customer.status !== 'active') {
            const response = NextResponse.json(
                { error: `Account is ${customer.status}. Please contact support.` },
                { status: 403 }
            );
            return addCorsHeaders(response, req);
        }

        const token = signToken({
            id: customer.id,
            email: customer.email,
        });

        const response = NextResponse.json({
            token,
            customer: {
                id: customer.id,
                user_id: customer.user_id,
                name: customer.name,
                email: customer.email,
                referCode: customer.referCode,
                level: customer.level,
            },
        });
        return addCorsHeaders(response, req);
    } catch (error) {
        console.error('Signin error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
