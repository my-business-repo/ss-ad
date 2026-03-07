import { db } from "@/lib/db";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SaveOrderPlanForm from "@/components/SaveOrderPlan/SaveOrderPlanForm";

export default async function NewSaveOrderPlanPage() {
    // Fetch available active products
    const products = await db.product.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <>
            <Breadcrumb pageName="Create New Save Order Plan" />
            <SaveOrderPlanForm products={products} />
        </>
    );
}
