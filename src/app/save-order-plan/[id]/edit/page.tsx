import { db } from "@/lib/db";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SaveOrderPlanForm from "@/components/SaveOrderPlan/SaveOrderPlanForm";
import { notFound } from "next/navigation";

export default async function EditSaveOrderPlanPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const planId = parseInt(resolvedParams.id);

    if (isNaN(planId)) {
        notFound();
    }

    // Fetch the existing plan and its items
    const plan = await db.savedOrderPlan.findUnique({
        where: { id: planId },
        include: {
            items: {
                include: {
                    product: true,
                },
                orderBy: {
                    sequence: "asc",
                },
            },
        },
    });

    if (!plan) {
        notFound();
    }

    // Fetch available active products
    const products = await db.product.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <>
            <Breadcrumb pageName="Edit Save Order Plan" />
            <SaveOrderPlanForm products={products} plan={plan} />
        </>
    );
}
