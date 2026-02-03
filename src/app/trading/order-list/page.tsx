import { OrderList } from "@/components/Trading/OrderList";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

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
