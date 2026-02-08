import { OrderList } from "@/components/Trading/OrderList";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default function OrderListPage() {
    return (
        <>
            <Breadcrumb pageName="Order List" />

            <div className="flex flex-col gap-10">
                <OrderList />
            </div>
        </>
    );
}
