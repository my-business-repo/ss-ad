import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { SaveOrderPlanTable } from "@/components/Tables/save-order-plan-list";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function SaveOrderPlanListPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;

    return (
        <>
            <Breadcrumb pageName="Save Order Plan List" />

            <div className="flex flex-col gap-10">
                <SaveOrderPlanTable page={page} pageSize={10} />
            </div>
        </>
    );
}
