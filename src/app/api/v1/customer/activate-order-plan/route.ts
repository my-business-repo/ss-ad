import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { handleCors, addCorsHeaders } from '@/lib/cors';

// Generate unique plan_id with format: PLN + timestamp + random
function generatePlanId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PLN${timestamp.slice(-4)}${random}`.substring(0, 12);
}

// Generate unique order_id with format: ORD + sequence + random
function generateOrderId(sequence: number): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `ORD${sequence.toString().padStart(2, '0')}${timestamp.slice(-3)}${random}`.substring(0, 12);
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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

        // 3. Check if customer already has an ACTIVE order plan
        const existingActivePlan = await db.orderPlan.findFirst({
            where: {
                customerId: customerId,
                status: 'ACTIVE',
            },
        });

        if (existingActivePlan) {
            const response = NextResponse.json(
                {
                    error: 'Customer already has an active order plan',
                    existingPlan: {
                        plan_id: existingActivePlan.plan_id,
                        completedOrders: existingActivePlan.completedOrders,
                        totalOrders: existingActivePlan.totalOrders,
                    }
                },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 4. Get all active products
        const products = await db.product.findMany({
            where: { status: 'active' },
        });

        if (products.length < 20) {
            const response = NextResponse.json(
                { error: `Not enough active products available. Need 20, found ${products.length}` },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 5. Shuffle products and select 20 random ones
        const shuffledProducts = shuffleArray(products);
        const selectedProducts = shuffledProducts.slice(0, 20);

        // 6. Generate unique plan_id
        let planId = generatePlanId();
        let isPlanIdUnique = false;
        while (!isPlanIdUnique) {
            const existing = await db.orderPlan.findUnique({ where: { plan_id: planId } });
            if (!existing) {
                isPlanIdUnique = true;
            } else {
                planId = generatePlanId();
            }
        }

        // 7. Pre-generate all unique order IDs (outside transaction to avoid timeout)
        const orderIds: string[] = [];
        for (let i = 0; i < 20; i++) {
            let orderId = generateOrderId(i + 1);
            let isOrderIdUnique = false;
            while (!isOrderIdUnique) {
                const existing = await db.order.findUnique({ where: { order_id: orderId } });
                if (!existing) {
                    isOrderIdUnique = true;
                } else {
                    orderId = generateOrderId(i + 1);
                }
            }
            orderIds.push(orderId);
        }

        // 8. Prepare order data for batch insert
        const ordersData = selectedProducts.map((product, i) => {

            // const commissionRate = customer.level?.commissionRate || 0;
            // const commission = product.price * (commissionRate / 100);
            const commission = product.commission;

            return {
                order_id: orderIds[i],
                orderPlanId: 0, // Placeholder, will be set after orderPlan is created
                productId: product.id,
                orderNumber: i + 1,
                amount: product.price,
                commission: commission,
                status: 'NOT_START' as const,
            };
        });

        // 9. Create OrderPlan and Orders in a transaction with extended timeout
        const result = await db.$transaction(async (tx) => {
            // Create OrderPlan
            const orderPlan = await tx.orderPlan.create({
                data: {
                    plan_id: planId,
                    customerId: customerId,
                    totalOrders: 20,
                    completedOrders: 0,
                    status: 'ACTIVE',
                    startedAt: new Date(),
                },
            });

            // Update orderPlanId in all orders data and batch insert
            const ordersWithPlanId = ordersData.map(order => ({
                ...order,
                orderPlanId: orderPlan.id,
            }));

            await tx.order.createMany({
                data: ordersWithPlanId,
            });

            return { orderPlan };
        }, {
            timeout: 30000, // 30 seconds timeout
        });

        // 10. Fetch the complete order plan with orders and products
        const completePlan = await db.orderPlan.findUnique({
            where: { id: result.orderPlan.id },
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

        const response = NextResponse.json({
            message: 'Order plan activated successfully',
            orderPlan: {
                id: completePlan?.id,
                plan_id: completePlan?.plan_id,
                totalOrders: completePlan?.totalOrders,
                completedOrders: completePlan?.completedOrders,
                status: completePlan?.status,
                startedAt: completePlan?.startedAt,
                orders: completePlan?.orders.map(order => ({
                    order_id: order.order_id,
                    orderNumber: order.orderNumber,
                    amount: order.amount,
                    commission: order.commission,
                    status: order.status,
                    product: order.product,
                })),
            },
        }, { status: 201 });
        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Activate order plan error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}