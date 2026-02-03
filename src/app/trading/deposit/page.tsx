import { Deposit } from "@/components/Trading/Deposit";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function DepositPage() {
    return (
        <>
            <Breadcrumb pageName="Deposit" />

            <div className="flex flex-col gap-10">
                <Deposit />
            </div>
        </>
    );
}
