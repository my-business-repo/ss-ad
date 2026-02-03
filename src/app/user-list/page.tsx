import { UserTable } from "@/components/Tables/user-list";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function UserListPage() {
    return (
        <>
            <Breadcrumb pageName="User List" />

            <div className="flex flex-col gap-10">
                <Suspense fallback={<div>Loading users...</div>}>
                    <UserTable />
                </Suspense>
            </div>
        </>
    );
}
