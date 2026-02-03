import { cn } from "@/lib/utils";

export function Chatting({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "h-[calc(100vh-180px)] rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Chatting
            </h2>
            <div className="flex h-full items-center justify-center text-body-base text-dark-4 dark:text-dark-6">
                Chat functionality coming soon.
            </div>
        </div>
    );
}
