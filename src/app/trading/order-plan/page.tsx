import { OrderPlanList } from "@/components/Trading/OrderPlanList";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function OrderPlanPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const search = params.search || '';

    return (
        <>
            <Breadcrumb pageName="Order Plan" />

            <div className="flex flex-col gap-10">
                <OrderPlanList page={page} pageSize={10} search={search} />
            </div>
        </>
    );
}
