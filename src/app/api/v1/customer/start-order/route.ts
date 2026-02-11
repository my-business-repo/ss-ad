
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { handleCors, addCorsHeaders } from '@/lib/cors';

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

        // 2. Parse request body
        let body;
        try {
            body = await req.json();
        } catch (e) {
            const response = NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        const { order_id } = body;

        if (!order_id) {
            const response = NextResponse.json(
                { error: 'order_id is required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 3. Find order and check ownership
        const order = await db.order.findUnique({
            where: { order_id: order_id },
            include: {
                orderPlan: true,
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
            }
        });

        if (!order) {
            const response = NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, req);
        }

        // Check if order belongs to customer
        if (order.orderPlan.customerId !== customerId) {
            const response = NextResponse.json(
                { error: 'Unauthorized access to this order' },
                { status: 403 }
            );
            return addCorsHeaders(response, req);
        }

        // 4. Update status if needed
        // If it's ALREADY pending or completed, maybe just return it? 
        // Or should we enforce it must be NOT_START?
        // The requirement says: "if so, change it state to pending".
        // Let's allow transition from NOT_START to PENDING.
        // If it's already PENDING, we can just return it (idempotency).
        // If it's COMPLETED or SKIPPED, we probably shouldn't set it back to PENDING.

        let updatedOrder = order;

        if (order.status === 'NOT_START') {
            updatedOrder = await db.order.update({
                where: { id: order.id },
                data: {
                    status: 'PENDING',
                    updatedAt: new Date(),
                },
                include: {
                    orderPlan: true,
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
                }
            });
        } else if (order.status !== 'PENDING') {
            // trying to start an order that is already completed or skipped?
            // checking requirement: "create new api call start-order ... change it state to pending"
            // I'll assume we only start 'NOT_START' orders. 
            // If it is 'PENDING', it's already started.
            // If 'COMPLETED' or 'SKIPPED', we shouldn't restart it usually.
            // I'll return the order as is for other statuses, or maybe error?
            // "return the order detail" -> implying success.
        }

        // 5. Return order details
        const response = NextResponse.json({
            message: 'Order started successfully',
            order: {
                order_id: updatedOrder.order_id,
                orderNumber: updatedOrder.orderNumber,
                amount: updatedOrder.amount,
                commission: updatedOrder.commission,
                status: updatedOrder.status,
                product: updatedOrder.product,
                createdAt: updatedOrder.createdAt,
                updatedAt: updatedOrder.updatedAt
            }
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Start order error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
