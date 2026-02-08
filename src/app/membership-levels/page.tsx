import { MembershipTable } from "@/components/Tables/membership-levels";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default function MembershipLevelsPage() {
    return (
        <>
            <Breadcrumb pageName="Membership Levels" />

            <div className="flex flex-col gap-10">
                <Suspense fallback={<div>Loading Details...</div>}>
                    <MembershipTable />
                </Suspense>
            </div>
        </>
    );
}
