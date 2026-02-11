'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type OrderListItem = {
    id: number;
    order_id: string;
    orderNumber: number;
    amount: number;
    commission: number;
    status: string;
    completedAt: Date | null;
    createdAt: Date;
    product: {
        name: string;
        image: string | null;
    };
    customer: {
        name: string;
        email: string;
        user_id: string; // Changed from level to user_id as requested
    };
};

export async function getOrders(page: number = 1, pageSize: number = 10, search: string = ''): Promise<{ orders: OrderListItem[], total: number }> {
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrderWhereInput = search ? {
        orderPlan: {
            customer: {
                OR: [
                    { user_id: { contains: search } }, // Search by user_id
                    { name: { contains: search } },    // Search by name
                    { email: { contains: search } },   // Search by email
                ]
            }
        }
    } : {};

    const [orders, total] = await Promise.all([
        db.order.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                product: {
                    select: {
                        name: true,
                        image: true,
                    }
                },
                orderPlan: {
                    include: {
                        customer: {
                            select: {
                                name: true,
                                email: true,
                                user_id: true, // Select user_id
                            }
                        }
                    }
                }
            }
        }),
        db.order.count({ where })
    ]);

    return {
        orders: orders.map((order: any) => ({
            id: order.id,
            order_id: order.order_id,
            orderNumber: order.orderNumber,
            amount: order.amount,
            commission: order.commission,
            status: order.status,
            completedAt: order.completedAt,
            createdAt: order.createdAt,
            product: {
                name: order.product.name,
                image: order.product.image,
            },
            customer: {
                name: order.orderPlan.customer.name,
                email: order.orderPlan.customer.email,
                user_id: order.orderPlan.customer.user_id,
            }
        })),
        total
    };
}
