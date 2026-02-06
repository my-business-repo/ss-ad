import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const customer = await db.customer.findUnique({
            where: { email },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, customer.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signToken({
            id: customer.id,
            email: customer.email,
        });

        return NextResponse.json({
            token,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
            },
        });
    } catch (error) {
        console.error('Signin error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
