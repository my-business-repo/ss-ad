'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type OrderPlanListItem = {
    id: number;
    plan_id: string;
    totalOrders: number;
    completedOrders: number;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    customer: {
        id: number;
        name: string;
        email: string | null;
        user_id: string;
    };
};

export async function getOrderPlans(page: number = 1, pageSize: number = 10, search: string = ''): Promise<{ orderPlans: OrderPlanListItem[], total: number }> {
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrderPlanWhereInput = search ? {
        customer: {
            OR: [
                { user_id: { contains: search } },
                { name: { contains: search } },
                { email: { contains: search } },
            ]
        }
    } : {};

    const [orderPlans, total] = await Promise.all([
        db.orderPlan.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        user_id: true,
                    }
                }
            }
        }),
        db.orderPlan.count({ where })
    ]);

    return {
        orderPlans: orderPlans.map((plan) => ({
            id: plan.id,
            plan_id: plan.plan_id,
            totalOrders: plan.totalOrders,
            completedOrders: plan.completedOrders,
            status: plan.status,
            startedAt: plan.startedAt,
            completedAt: plan.completedAt,
            createdAt: plan.createdAt,
            customer: {
                id: plan.customer.id,
                name: plan.customer.name,
                email: plan.customer.email,
                user_id: plan.customer.user_id,
            }
        })),
        total
    };
}

export type OrderPlanDetail = OrderPlanListItem & {
    orders: {
        id: number;
        order_id: string;
        orderNumber: number;
        amount: number;
        commission: number;
        status: string;
        createdAt: Date;
        product: {
            name: string;
            image: string | null;
        };
    }[];
};

export async function getOrderPlan(id: number): Promise<OrderPlanDetail | null> {
    const plan = await db.orderPlan.findUnique({
        where: { id },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    user_id: true,
                }
            },
            orders: {
                orderBy: {
                    orderNumber: 'asc'
                },
                include: {
                    product: {
                        select: {
                            name: true,
                            image: true,
                        }
                    }
                }
            }
        }
    });

    if (!plan) return null;

    return {
        id: plan.id,
        plan_id: plan.plan_id,
        totalOrders: plan.totalOrders,
        completedOrders: plan.completedOrders,
        status: plan.status,
        startedAt: plan.startedAt,
        completedAt: plan.completedAt,
        createdAt: plan.createdAt,
        customer: {
            id: plan.customer.id,
            name: plan.customer.name,
            email: plan.customer.email,
            user_id: plan.customer.user_id,
        },
        orders: plan.orders.map((order) => ({
            id: order.id,
            order_id: order.order_id,
            orderNumber: order.orderNumber,
            amount: order.amount,
            commission: order.commission,
            status: order.status,
            createdAt: order.createdAt,
            product: {
                name: order.product.name,
                image: order.product.image,
            }
        }))
    };
}

export async function updateOrderProduct(orderId: number, newProductId: number) {
    try {
        const product = await db.product.findUnique({
            where: { id: newProductId }
        });

        if (!product) {
            throw new Error("Product not found");
        }

        await db.order.update({
            where: { id: orderId },
            data: {
                productId: newProductId,
                amount: product.price,
                commission: product.commission
            }
        });

        revalidatePath("/trading/order-plan");
        return { success: true };
    } catch (error) {
        console.error("Failed to update order product:", error);
        return { success: false, error: "Failed to update order product" };
    }
}


// Generate unique order_id with format: ORD + sequence + random
function generateOrderId(sequence: number): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `ORD${sequence.toString().padStart(2, '0')}${timestamp.slice(-3)}${random}`.substring(0, 12);
}

export async function createOrder(planId: number, productId: number) {
    try {
        const product = await db.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new Error("Product not found");
        }

        const result = await db.$transaction(async (tx) => {
            // Get next order number
            const lastOrder = await tx.order.findFirst({
                where: { orderPlanId: planId },
                orderBy: { orderNumber: 'desc' }
            });
            const nextOrderNumber = (lastOrder?.orderNumber || 0) + 1;

            // Generate unique order ID
            let orderId = generateOrderId(nextOrderNumber);
            let isUnique = false;
            while (!isUnique) {
                const existing = await tx.order.findUnique({ where: { order_id: orderId } });
                if (!existing) isUnique = true;
                else orderId = generateOrderId(nextOrderNumber);
            }

            // Create Order
            const order = await tx.order.create({
                data: {
                    order_id: orderId,
                    orderPlanId: planId,
                    productId: productId,
                    orderNumber: nextOrderNumber,
                    amount: product.price,
                    commission: product.commission,
                    status: 'NOT_START',
                }
            });

            // Update Plan total
            await tx.orderPlan.update({
                where: { id: planId },
                data: { totalOrders: { increment: 1 } }
            });

            return order;
        });

        revalidatePath("/trading/order-plan");
        return { success: true };
    } catch (error) {
        console.error("Failed to create order:", error);
        return { success: false, error: "Failed to create order" };
    }
}

export async function deleteOrder(orderId: number, planId: number) {
    try {
        await db.$transaction(async (tx) => {
            // Delete Order
            await tx.order.delete({
                where: { id: orderId }
            });

            // Update Plan total
            await tx.orderPlan.update({
                where: { id: planId },
                data: { totalOrders: { decrement: 1 } }
            });
        });

        revalidatePath("/trading/order-plan");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete order:", error);
        return { success: false, error: "Failed to delete order" };
    }
}

export async function applySavedPlanToOrderPlan(planId: number, savedPlanId: number) {
    try {
        const savedPlan = await db.savedOrderPlan.findUnique({
            where: { id: savedPlanId },
            include: {
                items: {
                    include: { product: true },
                    orderBy: { sequence: "asc" }
                }
            }
        });

        if (!savedPlan || savedPlan.items.length === 0) {
            return { success: false, error: "Saved plan not found or is empty." };
        }

        const activePlan = await db.orderPlan.findUnique({
            where: { id: planId },
            include: {
                orders: {
                    where: { status: { in: ['NOT_START', 'PENDING'] } }
                }
            }
        });

        if (!activePlan) {
            return { success: false, error: "Active plan not found." };
        }

        // 1. Determine the starting order number for the new sequence based on completed orders
        const lastCompletedOrder = await db.order.findFirst({
            where: { orderPlanId: planId, status: { notIn: ['NOT_START', 'PENDING'] } },
            orderBy: { orderNumber: 'desc' }
        });

        let nextSequenceNumber = (lastCompletedOrder?.orderNumber ?? 0) + 1;
        let nextTotalOrders = activePlan.completedOrders;

        // 2. Generate new orders data in memory
        const newOrdersData: any[] = [];
        const generatedIds = new Set<string>();

        for (let i = 0; i < savedPlan.items.length; i++) {
            const item = savedPlan.items[i];
            const product = item.product;

            let orderId = generateOrderId(nextSequenceNumber);
            // Ensure no duplicate IDs within the same batch
            while (generatedIds.has(orderId)) {
                orderId = generateOrderId(nextSequenceNumber);
            }
            generatedIds.add(orderId);

            newOrdersData.push({
                order_id: orderId,
                orderPlanId: planId,
                productId: product.id,
                orderNumber: nextSequenceNumber,
                amount: product.price,
                commission: product.commission,
                status: 'NOT_START',
            });

            nextSequenceNumber++;
            nextTotalOrders++;
        }

        // 3. Resolve any ID collisions with existing database records
        let idsToCheck = Array.from(generatedIds);
        let maxRetries = 10;
        let retryCount = 0;

        while (idsToCheck.length > 0 && retryCount < maxRetries) {
            const existingOrders = await db.order.findMany({
                where: { order_id: { in: idsToCheck } },
                select: { order_id: true }
            });

            if (existingOrders.length === 0) break; // No collisions

            const collidingIds = new Set(existingOrders.map(o => o.order_id));
            idsToCheck = []; // Reset for next iteration

            // Re-generate colliding IDs
            for (let i = 0; i < newOrdersData.length; i++) {
                if (collidingIds.has(newOrdersData[i].order_id)) {
                    generatedIds.delete(newOrdersData[i].order_id);

                    let newOrderId = generateOrderId(newOrdersData[i].orderNumber);
                    while (generatedIds.has(newOrderId)) {
                        newOrderId = generateOrderId(newOrdersData[i].orderNumber);
                    }

                    generatedIds.add(newOrderId);
                    newOrdersData[i].order_id = newOrderId;
                    idsToCheck.push(newOrderId);
                }
            }
            retryCount++;
        }

        if (retryCount >= maxRetries) {
            throw new Error("Failed to generate unique order IDs after multiple attempts.");
        }

        // 4. Perform the database updates in a fast transaction
        await db.$transaction(async (tx) => {
            // Delete old uncompleted orders
            await tx.order.deleteMany({
                where: {
                    orderPlanId: planId,
                    status: { in: ['NOT_START', 'PENDING'] }
                }
            });

            // Insert all new orders at once
            if (newOrdersData.length > 0) {
                // @ts-ignore
                await tx.order.createMany({
                    data: newOrdersData
                });
            }

            // Update the OrderPlan total orders
            await tx.orderPlan.update({
                where: { id: planId },
                data: { totalOrders: nextTotalOrders }
            });
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        revalidatePath("/trading/order-plan");
        return { success: true };

    } catch (error) {
        console.error("Failed to apply saved plan:", error);
        return { success: false, error: "Failed to apply saved order plan." };
    }
}
