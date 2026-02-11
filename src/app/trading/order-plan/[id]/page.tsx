import { getOrderPlan } from "@/actions/order-plan";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { PlanDetails } from "@/components/Trading/PlanDetails";
import { PlanOrderTable } from "@/components/Trading/PlanOrderTable";
import { notFound } from "next/navigation";

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

    return (
        <>
            <Breadcrumb pageName="Order Plan Details" />

            <div className="flex flex-col gap-10">
                <PlanDetails plan={plan} />
                <PlanOrderTable orders={plan.orders} planId={plan.id} />
            </div>
        </>
    );
}
