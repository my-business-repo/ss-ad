
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

        // 3. Find order and include related data
        const order = await db.order.findUnique({
            where: { order_id: order_id },
            include: {
                orderPlan: true,
                product: true,
            }
        });

        if (!order) {
            const response = NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, req);
        }

        // 4. Validate Order Status and Ownership
        if (order.orderPlan.customerId !== customerId) {
            const response = NextResponse.json(
                { error: 'Unauthorized access to this order' },
                { status: 403 }
            );
            return addCorsHeaders(response, req);
        }

        if (order.status !== 'PENDING') {
            const response = NextResponse.json(
                { error: `Order status is ${order.status}, expected PENDING` },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 5. Check Customer Balance
        const account = await db.account.findFirst({
            where: { customerId: customerId },
        });

        if (!account) {
            const response = NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, req);
        }

        if (account.balance < order.product.price) {
            const response = NextResponse.json(
                { error: `Insufficient balance. Required: ${order.product.price} $, Available: ${account.balance} $` },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 6. Process Completion (Transaction)
        const result = await db.$transaction(async (tx) => {
            // Update Account: Add commission to balance and profit
            // Optimization: We could decrement price and increment (price + commission), but requirement implies just adding profit?
            // "add profit calc ... to the user profit and balance"
            // Usually in grab order systems, the principal is frozen or checked. If verified, principal + commission returns.
            // Since we didn't deduct principal at 'start-order', and we just checked sufficiency here, 
            // if we just add commission, strictly speaking the user gains money.
            // If the model is "User holds balance -> verify -> gain commission", this is correct.

            const commissionRate = order.commission; // 3 (%)
            const orderAmount = order.product.price;  // e.g. 100
            const commission = (orderAmount * commissionRate) / 100;

            await tx.account.update({
                where: { id: account.id },
                data: {
                    balance: { increment: commission },
                    profit: { increment: commission },
                }
            });

            // Update Order
            const updatedOrder = await tx.order.update({
                where: { id: order.id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
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
                }
            });

            // Update OrderPlan
            const updatedPlan = await tx.orderPlan.update({
                where: { id: order.orderPlanId },
                data: {
                    completedOrders: { increment: 1 },
                }
            });

            // Check if plan is completed
            if (updatedPlan.completedOrders >= updatedPlan.totalOrders) {
                await tx.orderPlan.update({
                    where: { id: updatedPlan.id },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                    }
                });
            }

            return updatedOrder;
        }, {
            maxWait: 5000, // default: 2000
            timeout: 20000, // default: 5000
        });

        // 7. Return updated order details
        const response = NextResponse.json({
            message: 'Order confirmed successfully',
            order: {
                order_id: result.order_id,
                orderNumber: result.orderNumber,
                amount: result.amount,
                commission: result.commission,
                status: result.status,
                completedAt: result.completedAt,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                product: result.product,
            }
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Confirm order error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
