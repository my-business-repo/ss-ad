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
    console.log("SIGNIN REQUEST:", req);
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const body = await req.json();
        console.log("SIGNIN REQUEST BODY:", body);
        const { phoneNumber, username, password } = body;

        const identifier = phoneNumber || username;

        if (!identifier || !password) {
            const response = NextResponse.json(
                { error: 'Phone Number/Username and password are required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        const customer = await db.customer.findFirst({
            where: {
                OR: [
                    { phoneNumber: identifier },
                    { user_id: identifier },
                    { name: identifier }
                ]
            },
            include: {
                level: true, // Include level info
            },
        });

        if (!customer) {
            console.error("DEBUG: Customer not found. Identifier given:", identifier);
            const response = NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }


        const isValid = await verifyPassword(password, customer.password);

        if (!isValid) {
            console.error("DEBUG: Customer found, but password invalid for id:", customer.id);
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
