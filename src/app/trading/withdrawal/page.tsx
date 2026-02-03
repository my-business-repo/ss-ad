import { Withdrawal } from "@/components/Trading/Withdrawal";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function WithdrawalPage() {
    return (
        <>
            <Breadcrumb pageName="Withdrawal" />

            <div className="flex flex-col gap-10">
                <Withdrawal />
            </div>
        </>
    );
}
