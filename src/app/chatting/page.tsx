import { Chatting } from "@/components/Chatting";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getCustomers } from "@/components/Tables/customer-list/fetch";

export default async function ChattingPage() {
    const customers = await getCustomers();

    return (
        <>
            <Breadcrumb pageName="Chatting" />

            <div className="flex flex-col gap-10">
                <Chatting initialCustomers={customers} />
            </div>
        </>
    );
}
