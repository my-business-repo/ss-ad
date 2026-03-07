"use client";

import { useState } from "react";
import { TrashIcon } from "@/assets/icons";
import { deleteSaveOrderPlan } from "@/actions/save-order-plan";

export default function DeletePlanButton({ planId }: { planId: number }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this save order plan? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteSaveOrderPlan(planId);
        } catch (error) {
            console.error(error);
            alert("Failed to delete the plan.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
            title="Delete"
        >
            <TrashIcon />
        </button>
    );
}
