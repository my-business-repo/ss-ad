import { getOrderPlan } from "@/actions/order-plan";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { PlanDetails } from "@/components/Trading/PlanDetails";
import { PlanOrderTable } from "@/components/Trading/PlanOrderTable";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function OrderPlanDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const planId = parseInt(id);

    if (isNaN(planId)) {
        return notFound();
    }

    const plan = await getOrderPlan(planId);

    if (!plan) {
        return notFound();
    }

    const savedPlans = await db.savedOrderPlan.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            _count: {
                select: { items: true }
            }
        }
    });

    // Fetch the customer's current account balance for the balance simulation column
    const customerAccount = await db.account.findFirst({
        where: { customerId: plan.customer.id },
        select: { balance: true }
    });
    const currentBalance = customerAccount?.balance ?? 0;

    return (
        <>
            <Breadcrumb pageName="Order Plan Details" />

            <div className="flex flex-col gap-10">
                <PlanDetails plan={plan} />
                <PlanOrderTable
                    orders={plan.orders}
                    planId={plan.id}
                    savedPlans={savedPlans}
                    currentBalance={currentBalance}
                />
            </div>
        </>
    );
}
