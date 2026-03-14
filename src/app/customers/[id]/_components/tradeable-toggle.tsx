import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleCustomerTradeable } from "@/actions/customer-actions";

interface TradeableToggleProps {
    customerId: string;
    initialTradeable: boolean;
}

export const TradeableToggle: React.FC<TradeableToggleProps> = ({ customerId, initialTradeable }) => {
    const [isPending, startTransition] = useTransition();
    const [tradeable, setTradeable] = useState(initialTradeable);
    const router = useRouter();

    const handleToggle = () => {
        const newValue = !tradeable;
        setTradeable(newValue);

        startTransition(async () => {
            const result = await toggleCustomerTradeable(customerId, newValue);
            
            if (result.success) {
                // Success: optionally alert the user or just let it refresh
                router.refresh();
            } else {
                alert(result.message || "Failed to update tradeable status");
                // Revert on error
                setTradeable(!newValue);
            }
        });
    };

    return (
        <label
            htmlFor="tradeableToggle"
            className="flex cursor-pointer select-none items-center"
        >
            <div className="relative">
                <input
                    type="checkbox"
                    id="tradeableToggle"
                    className="sr-only"
                    checked={tradeable}
                    onChange={handleToggle}
                    disabled={isPending}
                />
                <div className={`block h-8 w-14 rounded-full ${tradeable ? 'bg-primary' : 'bg-stroke dark:bg-dark-3'}`}></div>
                <div
                    className={`absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
                        tradeable ? "translate-x-full" : ""
                    }`}
                    style={{ top: '4px' }}
                ></div>
            </div>
            <span className="ml-3 font-medium text-dark dark:text-white">
                {tradeable ? "Yes" : "No"} {isPending && "(Saving...)"}
            </span>
        </label>
    );
};
