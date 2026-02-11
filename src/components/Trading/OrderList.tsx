
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getOrders } from "@/actions/order";
import { Pagination } from "@/components/Pagination";
import { format } from "date-fns";

import OrderSearch from "./OrderSearch";

interface OrderListProps {
    className?: string;
    page?: number;
    pageSize?: number;
    search?: string;
}

export async function OrderList({ className, page = 1, pageSize = 10, search = '' }: OrderListProps) {
    const { orders: data, total } = await getOrders(page, pageSize, search);
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
                    Showing {data.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, total)} of {total} orders
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="w-[60px] !text-center">#</TableHead>
                        <TableHead className="min-w-[120px] !text-left">Order ID</TableHead>
                        <TableHead className="min-w-[150px] !text-left">Customer</TableHead>
                        <TableHead className="min-w-[150px] !text-left">Product</TableHead>
                        <TableHead className="!text-right">Amount</TableHead>
                        <TableHead className="!text-right">Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="!text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((order, index) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={order.id}
                        >
                            <TableCell className="!text-center font-semibold text-gray-500 dark:text-gray-400">
                                {startIndex + index + 1}
                            </TableCell>

                            <TableCell className="!text-left">
                                {order.order_id}
                                <div className="text-xs text-gray-400">#{order.orderNumber}</div>
                            </TableCell>

                            <TableCell className="!text-left">
                                <div>
                                    <div className="font-medium">{order.customer.name}</div>
                                    <div className="text-xs text-gray-500">{order.customer.user_id}</div>
                                </div>
                            </TableCell>

                            <TableCell className="!text-left">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        {order.product.image ? (
                                            <img
                                                src={order.product.image}
                                                alt={order.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-500 text-[10px]">
                                                No Img
                                            </div>
                                        )}
                                    </div>
                                    <span className="truncate max-w-[150px]" title={order.product.name}>
                                        {order.product.name}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="!text-right">
                                ${order.amount.toFixed(2)}
                            </TableCell>

                            <TableCell className="!text-right">
                                ${order.commission.toFixed(2)}
                            </TableCell>

                            <TableCell>
                                <span
                                    className={cn(
                                        "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                                        order.status === "COMPLETED"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "PENDING"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : order.status === "NOT_START"
                                                    ? "bg-gray-100 text-gray-800"
                                                    : "bg-red-100 text-red-800"
                                    )}
                                >
                                    {order.status}
                                </span>
                            </TableCell>

                            <TableCell className="!text-right text-sm">
                                <div>
                                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {format(new Date(order.createdAt), "HH:mm")}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                                No orders found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/trading/order-list"
            />
        </div>
    );
}
