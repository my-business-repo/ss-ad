import { CustomerTable } from "@/components/Tables/customer-list";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default function CustomerListPage() {
    return (
        <>
            <Breadcrumb pageName="Customer List" />

            <div className="flex flex-col gap-10">
                <Suspense fallback={<div>Loading customers...</div>}>
                    <CustomerTable />
                </Suspense>
            </div>
        </>
    );
}
