import { OrderPlanDetail } from "@/actions/order-plan";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function PlanDetails({ plan }: { plan: OrderPlanDetail }) {
    return (
        <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-2xlg font-bold text-dark dark:text-white">
                Plan Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-500">Plan ID</span>
                    <span className="text-base font-semibold text-dark dark:text-white">{plan.plan_id}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-500">Customer</span>
                    <div className="flex flex-col">
                        <span className="text-base font-semibold text-dark dark:text-white">{plan.customer.name}</span>
                        <span className="text-sm text-gray-500">{plan.customer.email}</span>
                        <span className="text-xs text-primary">{plan.customer.user_id}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div>
                        <span
                            className={cn(
                                "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                                plan.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : plan.status === "ACTIVE"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                            )}
                        >
                            {plan.status}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-500">Progress</span>
                    <span className="text-base font-semibold text-dark dark:text-white">
                        {plan.completedOrders} / {plan.totalOrders}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-500">Started At</span>
                    <span className="text-base font-semibold text-dark dark:text-white">
                        {format(plan.startedAt, "MMM dd, yyyy HH:mm")}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-500">Completed At</span>
                    <span className="text-base font-semibold text-dark dark:text-white">
                        {plan.completedAt ? format(plan.completedAt, "MMM dd, yyyy HH:mm") : "-"}
                    </span>
                </div>
            </div>
        </div>
    );
}
