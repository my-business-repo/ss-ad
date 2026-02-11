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

export async function GET(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // 1. Verify token from Authorization header
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

        // 2. Check if customer exists
        const customer = await db.customer.findUnique({
            where: { id: customerId },
            include: { level: true },
        });

        if (!customer) {
            const response = NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, req);
        }

        // 3. Get the active order plan with all orders and products
        let orderPlan = await db.orderPlan.findFirst({
            where: {
                customerId: customerId,
                status: 'ACTIVE',
            },
            include: {
                orders: {
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
                            },
                        },
                    },
                    orderBy: { orderNumber: 'asc' },
                },
            },
        });

        if (!orderPlan) {
            // Check for completed plan
            orderPlan = await db.orderPlan.findFirst({
                where: {
                    customerId: customerId,
                    status: 'COMPLETED',
                },
                orderBy: {
                    completedAt: 'desc'
                },
                include: {
                    orders: {
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
                                },
                            },
                        },
                        orderBy: { orderNumber: 'asc' },
                    },
                },
            });
        }

        if (!orderPlan) {
            const response = NextResponse.json(
                {
                    error: 'No active or completed order plan found',
                    hasActivePlan: false,
                },
                { status: 404 }
            );
            return addCorsHeaders(response, req);
        }

        // 4. Return order plan info with progress
        const response = NextResponse.json({
            hasActivePlan: true, // This is true if we return ANY plan (active or completed) in this context? 
            // Or should it differentiate? The user request implies returning the plan content.
            // Let's keep it true to indicate "we found a plan you can view".
            orderPlan: {
                id: orderPlan.id,
                plan_id: orderPlan.plan_id,
                totalOrders: orderPlan.totalOrders,
                completedOrders: orderPlan.completedOrders,
                remainingOrders: orderPlan.totalOrders - orderPlan.completedOrders,
                progress: Math.round((orderPlan.completedOrders / orderPlan.totalOrders) * 100),
                status: orderPlan.status,
                startedAt: orderPlan.startedAt,
                completedAt: orderPlan.completedAt,
                orders: orderPlan.orders.map(order => ({
                    order_id: order.order_id,
                    orderNumber: order.orderNumber,
                    amount: order.amount,
                    commission: order.commission,
                    status: order.status,
                    completedAt: order.completedAt,
                    product: order.product,
                })),
            },
        }, { status: 200 });
        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Get order plan error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
