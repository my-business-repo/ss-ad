"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteOrderPlan } from "@/actions/order-plan";

interface DeleteOrderPlanButtonProps {
    planId: number;
}

export function DeleteOrderPlanButton({ planId }: DeleteOrderPlanButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this order plan? This action cannot be undone and will delete all associated orders.")) {
            return;
        }

        startTransition(async () => {
            const result = await deleteOrderPlan(planId);
            if (!result.success) {
                alert(result.error || "Failed to delete order plan.");
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            title="Delete Order Plan"
        >
            <TrashIcon className="h-4 w-4" />
            {isPending ? "Deleting..." : "Delete"}
        </button>
    );
}
