import { CustomerTable } from "@/components/Tables/customer-list";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function CustomerListPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; search?: string; tradeable?: string }>
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const search = params.search ?? '';
    const tradeable = params.tradeable ?? '';

    return (
        <>
            <div className="flex flex-col gap-10">
                <Suspense fallback={<div>Loading customers...</div>}>
                    <CustomerTable page={page} pageSize={10} search={search} tradeable={tradeable} />
                </Suspense>
            </div>
        </>
    );
}
