
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { handleCors, addCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

export async function GET(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // 1. Verify token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            const response = NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        const customerId = decoded.id;

        // 2. Get orders excluding NOT_START
        // We need to filter by customer's order plans first.
        // Actually, we can just findMany orders where orderPlan.customerId = customerId AND status != NOT_START.

        const orders = await db.order.findMany({
            where: {
                orderPlan: {
                    customerId: customerId,
                },
                status: {
                    not: 'NOT_START',
                }
            },
            include: {
                product: {
                    select: {
                        product_id: true,
                        name: true,
                        description: true,
                        price: true,
                        commission: true,
                        rating: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc', // Or createdAt? Usually users want to see recent activity.
            }
        });

        // 3. Return orders
        const response = NextResponse.json({
            orders: orders.map(order => ({
                order_id: order.order_id,
                orderNumber: order.orderNumber,
                amount: order.amount,
                commission: order.commission,
                status: order.status,
                completedAt: order.completedAt,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                product: order.product,
            })),
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Get orders error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
