import { db } from "@/lib/db";

export async function getSaveOrderPlans(page: number = 1, pageSize: number = 10, search: string = '') {
    try {
        const skip = (page - 1) * pageSize;
        const where = search ? { name: { contains: search } } : {};

        const [plans, total] = await Promise.all([
            db.savedOrderPlan.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: { items: true },
                    },
                },
            }),
            db.savedOrderPlan.count({ where }),
        ]);

        return {
            plans: plans.map((plan) => ({
                id: plan.id,
                name: plan.name,
                itemCount: plan._count.items,
                createdAt: plan.createdAt.toISOString(),
            })),
            total,
        };
    } catch (error) {
        console.error("Failed to fetch save order plans:", error);
        return { plans: [], total: 0 };
    }
}
