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
        name: string;
        email: string;
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
