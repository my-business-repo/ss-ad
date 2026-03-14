'use client';

import { OrderPlanDetail } from "@/actions/order-plan";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PencilSquareIcon, TrashIcon, PlusIcon } from "@/assets/icons";
import { useState } from "react";
import { EditOrderModal } from "./EditOrderModal";
import { NewOrderModal } from "./NewOrderModal";
import { deleteOrder } from "@/actions/order-plan";
import { Modal } from "@/components/ui/modal";
import { ApplyTemplateModal } from "./ApplyTemplateModal";

type SavedPlanOption = {
    id: number;
    name: string | null;
    _count: { items: number };
};

export function PlanOrderTable({ orders, planId, savedPlans, currentBalance }: { orders: OrderPlanDetail['orders'], planId: number, savedPlans: SavedPlanOption[], currentBalance: number }) {
    const [editingOrder, setEditingOrder] = useState<typeof orders[0] | null>(null);
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [isApplyTemplateOpen, setIsApplyTemplateOpen] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState<{ order: typeof orders[0], index: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deletingOrder) return;
        setIsDeleting(true);
        try {
            const res = await deleteOrder(deletingOrder.order.id, planId);
            if (res.success) {
                setDeletingOrder(null);
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed");
        } finally {
            setIsDeleting(false);
        }
    };

    // Compute per-row estimated balance
    // Walk through orders in sequence:
    //   - COMPLETED orders already happened → add their commission to the running balance
    //   - NOT_START / PENDING orders → check if simulated balance can cover price;
    //     if yes → project balance after commission; if no → mark insufficient, skip (don't add)
    type BalanceRow = { balance: number; insufficient: boolean; skipped: boolean };
    const balanceRows: BalanceRow[] = [];
    let runningBalance = currentBalance;

    // First subtract commissions already earned from COMPLETED orders, since currentBalance
    // already reflects them. So we reconstruct from scratch:
    // Start from currentBalance and walk forward (orders are sorted by orderNumber asc).
    // COMPLETED orders: their commission is already in the balance — we just track forward.
    // NOT_START/PENDING: simulate.
    for (const order of orders) {
        const commission = (order.amount * order.commission) / 100;
        if (order.status === 'COMPLETED') {
            // Already happened — balance already reflects this. Just show what it is now.
            // We don't double-add; instead we show the current running balance.
            balanceRows.push({ balance: runningBalance, insufficient: false, skipped: false });
            // Note: we do NOT increment here because currentBalance already includes all past earnings.
        } else {
            // Future order: simulate
            if (runningBalance >= order.amount) {
                runningBalance += commission; // balance increases by commission earned
                balanceRows.push({ balance: runningBalance, insufficient: false, skipped: false });
            } else {
                balanceRows.push({ balance: runningBalance, insufficient: true, skipped: true });
                // Do NOT change runningBalance — this step is skipped
            }
        }
    }

    return (
        <>
            <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                        Orders
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setIsApplyTemplateOpen(true)}
                            className="inline-flex items-center justify-center rounded-md border border-primary px-6 py-4 text-center font-medium text-primary hover:bg-primary hover:text-white dark:hover:text-white"
                        >
                            Apply Template
                        </button>
                        <button
                            onClick={() => setIsNewOrderModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        >
                            <span>
                                <PlusIcon className="h-4 w-4 stroke-2" />
                            </span>
                            New Order
                        </button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="border-none uppercase [&>th]:text-center">
                            <TableHead className="w-[60px] !text-center">#</TableHead>
                            <TableHead className="w-[100px] !text-center">Actions</TableHead>
                            <TableHead className="min-w-[120px] !text-left">Order ID</TableHead>
                            <TableHead className="min-w-[150px] !text-left">Product</TableHead>
                            <TableHead className="!text-right">Amount</TableHead>
                            <TableHead className="!text-right">Commission</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="!text-right">Est. Balance</TableHead>
                            <TableHead className="!text-right">Created At</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {orders.map((order, index) => {
                            const row = balanceRows[index];
                            return (
                            <TableRow
                                className={cn(
                                    "text-center text-base font-medium text-dark dark:text-white",
                                    row?.insufficient ? "opacity-70" : ""
                                )}
                                key={order.id}
                            >
                                <TableCell className="!text-center font-semibold text-gray-500 dark:text-gray-400">
                                    {index + 1}
                                </TableCell>

                                <TableCell className="!text-center">
                                    {order.status !== "COMPLETED" && (
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="text-primary hover:text-primary/80"
                                                title="Edit"
                                                onClick={() => setEditingOrder(order)}
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete"
                                                onClick={() => setDeletingOrder({ order, index })}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell className="!text-left">
                                    {order.order_id}
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

                                {/* Estimated balance after this step */}
                                <TableCell className="!text-right">
                                    {row?.insufficient ? (
                                        <span className="text-red-500 font-medium text-sm">
                                            Insufficient
                                            <br />
                                            <span className="text-xs text-red-400 font-normal">
                                                Need ${order.amount.toFixed(2)}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className={cn(
                                            "font-medium text-sm",
                                            order.status === 'COMPLETED'
                                                ? "text-gray-500 dark:text-gray-400"
                                                : "text-green-600 dark:text-green-400"
                                        )}>
                                            ${row?.balance.toFixed(2)}
                                            {order.status !== 'COMPLETED' && (
                                                <span className="block text-xs text-green-500 font-normal">
                                                    +${((order.amount * order.commission) / 100).toFixed(2)} commission
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </TableCell>

                                <TableCell className="!text-right text-sm">
                                    <div>
                                        {format(order.createdAt, "MMM dd, yyyy")}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {format(order.createdAt, "HH:mm")}
                                    </div>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {editingOrder && (
                <EditOrderModal
                    isOpen={!!editingOrder}
                    onClose={() => setEditingOrder(null)}
                    orderId={editingOrder.id}
                    currentProductName={editingOrder.product.name}
                    currentProductImage={editingOrder.product.image}
                />
            )}

            <NewOrderModal
                isOpen={isNewOrderModalOpen}
                onClose={() => setIsNewOrderModalOpen(false)}
                planId={planId}
            />

            <ApplyTemplateModal
                isOpen={isApplyTemplateOpen}
                onClose={() => setIsApplyTemplateOpen(false)}
                planId={planId}
                savedPlans={savedPlans}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingOrder}
                onClose={() => setDeletingOrder(null)}
                title="Delete Order"
            >
                <div className="py-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete order <span className="font-semibold text-dark dark:text-white">#{deletingOrder ? deletingOrder.index + 1 : ''}</span> ({deletingOrder?.order.order_id})?
                        This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setDeletingOrder(null)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
