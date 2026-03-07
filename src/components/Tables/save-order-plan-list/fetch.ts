import { db } from "@/lib/db";

export async function getSaveOrderPlans(page: number = 1, pageSize: number = 10) {
    try {
        const skip = (page - 1) * pageSize;

        const [plans, total] = await Promise.all([
            db.savedOrderPlan.findMany({
                skip,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: { items: true },
                    },
                },
            }),
            db.savedOrderPlan.count(),
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
