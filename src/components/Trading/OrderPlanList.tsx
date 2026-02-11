import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getOrderPlans } from "@/actions/order-plan";
import { Pagination } from "@/components/Pagination";
import { format } from "date-fns";
import OrderSearch from "./OrderSearch";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

interface OrderPlanListProps {
    className?: string;
    page?: number;
    pageSize?: number;
    search?: string;
}

export async function OrderPlanList({ className, page = 1, pageSize = 10, search = '' }: OrderPlanListProps) {
    const { orderPlans: data, total } = await getOrderPlans(page, pageSize, search);
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;

    return (
        <div
            className={cn(
                "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:max-w-md">
                    <OrderSearch />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {data.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, total)} of {total} plans
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="w-[60px] !text-center">#</TableHead>
                        <TableHead className="min-w-[120px] !text-left">Plan ID</TableHead>
                        <TableHead className="min-w-[150px] !text-left">Customer</TableHead>
                        <TableHead className="!text-center">Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="!text-right">Started At</TableHead>
                        <TableHead className="!text-right">Completed At</TableHead>
                        <TableHead className="!text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((plan, index) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={plan.id}
                        >
                            <TableCell className="!text-center font-semibold text-gray-500 dark:text-gray-400">
                                {startIndex + index + 1}
                            </TableCell>

                            <TableCell className="!text-left">
                                {plan.plan_id}
                            </TableCell>

                            <TableCell className="!text-left">
                                <div>
                                    <div className="font-medium">{plan.customer.name}</div>
                                    <div className="text-xs text-gray-500">{plan.customer.user_id}</div>
                                </div>
                            </TableCell>

                            <TableCell className="!text-center">
                                {plan.completedOrders} / {plan.totalOrders}
                            </TableCell>

                            <TableCell>
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
                            </TableCell>

                            <TableCell className="!text-right text-sm">
                                <div>
                                    {format(new Date(plan.startedAt), "MMM dd, yyyy")}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {format(new Date(plan.startedAt), "HH:mm")}
                                </div>
                            </TableCell>

                            <TableCell className="!text-right text-sm">
                                {plan.completedAt ? (
                                    <>
                                        <div>
                                            {format(new Date(plan.completedAt), "MMM dd, yyyy")}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {format(new Date(plan.completedAt), "HH:mm")}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </TableCell>

                            <TableCell className="!text-right">
                                {plan.status !== "COMPLETED" && (
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/trading/order-plan/${plan.id}`}
                                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90"
                                        >
                                            <Cog6ToothIcon className="h-4 w-4" />
                                            Customize
                                        </Link>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                                No order plans found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/trading/order-plan"
            />
        </div>
    );
}
