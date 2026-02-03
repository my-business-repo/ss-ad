import { cn } from "@/lib/utils";

export function OrderList({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Order List
            </h2>
            <p className="text-body-base text-dark-4 dark:text-dark-6">
                Order List functionality coming soon.
            </p>
        </div>
    );
}
