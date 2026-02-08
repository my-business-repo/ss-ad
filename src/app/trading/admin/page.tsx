import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { AdminTable } from "@/components/Tables/admin-list";
import { CreateAdminForm } from "@/components/Tables/admin-list/create-admin-form";
import { Suspense } from "react";

export const metadata = {
    title: "Admin List | S Admin",
    description: "List of all administrators",
};

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default function AdminListPage() {
    return (
        <>
            <Breadcrumb pageName="Admin List" />

            <div className="flex flex-col gap-10">
                <div className="flex justify-between items-center">
                    {/* Spacer or Title if needed, otherwise Button on right */}
                    <div />
                    <CreateAdminForm />
                </div>
                <Suspense fallback={<div>Loading admins...</div>}>
                    <AdminTable />
                </Suspense>
            </div>
        </>
    );
}
