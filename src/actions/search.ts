"use server";

import { db as prisma } from "@/lib/db";

export async function globalSearch(query: string) {
  if (!query || query.trim() === "") {
    return {
      customers: [],
      products: [],
      orders: [],
      transactions: [],
      orderPlans: [],
      savedOrderPlans: [],
      notifications: [],
    };
  }

  const searchTerm = query.trim();

  try {
    const [
      customers,
      products,
      orders,
      transactions,
      orderPlans,
      savedOrderPlans,
      notifications,
    ] = await Promise.all([
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { user_id: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { phoneNumber: { contains: searchTerm } },
          ],
        },
        take: 5,
        select: { id: true, user_id: true, name: true, email: true },
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { product_id: { contains: searchTerm } },
          ],
        },
        take: 5,
        select: { id: true, product_id: true, name: true, price: true },
      }),
      prisma.order.findMany({
        where: {
          order_id: { contains: searchTerm },
        },
        take: 5,
        select: { id: true, order_id: true, status: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.findMany({
        where: {
          transaction_id: { contains: searchTerm },
        },
        take: 5,
        select: { id: true, transaction_id: true, type: true, amount: true, status: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderPlan.findMany({
        where: {
          plan_id: { contains: searchTerm },
        },
        take: 5,
        select: { id: true, plan_id: true, status: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.savedOrderPlan.findMany({
        where: {
          name: { contains: searchTerm },
        },
        take: 5,
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: {
          message: { contains: searchTerm },
        },
        take: 5,
        select: { id: true, type: true, message: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      customers,
      products,
      orders,
      transactions,
      orderPlans,
      savedOrderPlans,
      notifications,
    };
  } catch (error) {
    console.error("Global search error:", error);
    // Return empty arrays on error so the UI handles it gracefully
    return {
      customers: [],
      products: [],
      orders: [],
      transactions: [],
      orderPlans: [],
      savedOrderPlans: [],
      notifications: [],
    };
  }
}
