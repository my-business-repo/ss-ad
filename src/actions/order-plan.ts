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
        hasActivePlan?: boolean;
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
                        _count: {
                            select: {
                                orderPlans: {
                                    where: {
                                        status: 'ACTIVE'
                                    }
                                }
                            }
                        }
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
                hasActivePlan: plan.customer._count.orderPlans > 0,
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
            where: { id: planId }
        });

        if (!activePlan) {
            return { success: false, error: "Active plan not found." };
        }

        // 1. Resetting sequence to 1
        let nextSequenceNumber = 1;
        let nextTotalOrders = 0; // We will increment it in the loop, or set it to savedPlan.items.length

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
            // Delete ALL old orders
            await tx.order.deleteMany({
                where: {
                    orderPlanId: planId
                }
            });

            // Insert all new orders at once
            if (newOrdersData.length > 0) {
                // @ts-ignore
                await tx.order.createMany({
                    data: newOrdersData
                });
            }

            // Update the OrderPlan state, completely resetting it
            await tx.orderPlan.update({
                where: { id: planId },
                data: { 
                    totalOrders: nextTotalOrders,
                    completedOrders: 0,
                    status: 'ACTIVE'
                }
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

// Generate unique plan_id with format: PLN + timestamp + random
function generatePlanId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PLN${timestamp.slice(-4)}${random}`.substring(0, 12);
}

export async function createNewOrderPlan(customerId: number, type: 'random' | 'saved', savedPlanId?: number) {
    try {
        // Double check no active plan exists
        const activePlan = await db.orderPlan.findFirst({
            where: {
                customerId,
                status: 'ACTIVE'
            }
        });

        if (activePlan) {
            return { success: false, error: "Customer already has an active order plan." };
        }

        const customer = await db.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            return { success: false, error: "Customer not found." };
        }

        let planId = generatePlanId();
        let isPlanIdUnique = false;
        while (!isPlanIdUnique) {
            const existing = await db.orderPlan.findUnique({ where: { plan_id: planId } });
            if (!existing) isPlanIdUnique = true;
            else planId = generatePlanId();
        }

        if (type === 'random') {
            const products = await db.product.findMany({ where: { status: 'active' } });
            if (products.length === 0) return { success: false, error: "No products available." };

            const selectedProducts = [];
            for (let i = 0; i < 40; i++) {
                const randomIndex = Math.floor(Math.random() * products.length);
                selectedProducts.push(products[randomIndex]);
            }

            const orderIds: string[] = [];
            for (let i = 0; i < 40; i++) {
                let orderId = generateOrderId(i + 1);
                let isUnique = false;
                while (!isUnique) {
                    const existing = await db.order.findUnique({ where: { order_id: orderId } });
                    if (!existing) isUnique = true;
                    else orderId = generateOrderId(i + 1);
                }
                orderIds.push(orderId);
            }

            const ordersData = selectedProducts.map((product, i) => ({
                order_id: orderIds[i],
                orderPlanId: 0,
                productId: product.id,
                orderNumber: i + 1,
                amount: product.price,
                commission: product.commission,
                status: 'NOT_START' as const,
            }));

            await db.$transaction(async (tx) => {
                const orderPlan = await tx.orderPlan.create({
                    data: {
                        plan_id: planId,
                        customerId: customerId,
                        totalOrders: 40,
                        completedOrders: 0,
                        status: 'ACTIVE',
                        startedAt: new Date(),
                    },
                });

                const ordersWithPlanId = ordersData.map(order => ({
                    ...order,
                    orderPlanId: orderPlan.id,
                }));

                await tx.order.createMany({ data: ordersWithPlanId });
            }, { timeout: 30000 });

            revalidatePath("/trading/order-plan");
            return { success: true };

        } else if (type === 'saved' && savedPlanId) {
            const savedPlan = await db.savedOrderPlan.findUnique({
                where: { id: savedPlanId },
                include: { items: { include: { product: true }, orderBy: { sequence: 'asc' } } }
            });

            if (!savedPlan || savedPlan.items.length === 0) {
                return { success: false, error: "Saved plan not found or is empty." };
            }

            const newOrdersData: any[] = [];
            const generatedIds = new Set<string>();
            let nextSequenceNumber = 1;

            for (let i = 0; i < savedPlan.items.length; i++) {
                const item = savedPlan.items[i];
                const product = item.product;

                let orderId = generateOrderId(nextSequenceNumber);
                while (generatedIds.has(orderId)) orderId = generateOrderId(nextSequenceNumber);
                generatedIds.add(orderId);

                newOrdersData.push({
                    order_id: orderId,
                    orderPlanId: 0,
                    productId: product.id,
                    orderNumber: nextSequenceNumber,
                    amount: product.price,
                    commission: product.commission,
                    status: 'NOT_START',
                });
                nextSequenceNumber++;
            }

            let idsToCheck = Array.from(generatedIds);
            let retryCount = 0;

            while (idsToCheck.length > 0 && retryCount < 10) {
                const existingOrders = await db.order.findMany({
                    where: { order_id: { in: idsToCheck } },
                    select: { order_id: true }
                });

                if (existingOrders.length === 0) break;

                const collidingIds = new Set(existingOrders.map(o => o.order_id));
                idsToCheck = [];

                for (let i = 0; i < newOrdersData.length; i++) {
                    if (collidingIds.has(newOrdersData[i].order_id)) {
                        generatedIds.delete(newOrdersData[i].order_id);
                        let newOrderId = generateOrderId(newOrdersData[i].orderNumber);
                        while (generatedIds.has(newOrderId)) newOrderId = generateOrderId(newOrdersData[i].orderNumber);
                        generatedIds.add(newOrderId);
                        newOrdersData[i].order_id = newOrderId;
                        idsToCheck.push(newOrderId);
                    }
                }
                retryCount++;
            }

            if (retryCount >= 10) throw new Error("Failed to generate unique order IDs");

            await db.$transaction(async (tx) => {
                const orderPlan = await tx.orderPlan.create({
                    data: {
                        plan_id: planId,
                        customerId: customerId,
                        totalOrders: savedPlan.items.length,
                        completedOrders: 0,
                        status: 'ACTIVE',
                        startedAt: new Date(),
                    },
                });

                const finalOrders = newOrdersData.map(o => ({ ...o, orderPlanId: orderPlan.id }));
                // @ts-ignore
                await tx.order.createMany({ data: finalOrders });
            }, { maxWait: 5000, timeout: 20000 });

            revalidatePath("/trading/order-plan");
            return { success: true };

        } else {
            return { success: false, error: "Invalid plan assignment type." };
        }

    } catch (error) {
        console.error("Failed to create new order plan:", error);
        return { success: false, error: "Failed to create new order plan." };
    }
}
