import { CustomerTable } from "@/components/Tables/customer-list";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function CustomerListPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;

    return (
        <>
            <div className="flex flex-col gap-10">
                <Suspense fallback={<div>Loading customers...</div>}>
                    <CustomerTable page={page} pageSize={10} />
                </Suspense>
            </div>
        </>
    );
}
