"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { AssignNewPlanModal } from "./AssignNewPlanModal";

type SavedPlanOption = {
    id: number;
    name: string | null;
    _count: { items: number };
};

interface NewPlanButtonProps {
    customerId: number;
    disabled: boolean;
    savedPlans: SavedPlanOption[];
}

export function NewPlanButton({ customerId, disabled, savedPlans }: NewPlanButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={disabled}
                title={disabled ? "Customer already has an active plan" : "Assign New Plan"}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-opacity ${
                    disabled ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-green-600 hover:bg-opacity-90"
                }`}
            >
                <PlusIcon className="h-4 w-4" />
                New Plan
            </button>

            {isModalOpen && (
                <AssignNewPlanModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    customerId={customerId}
                    savedPlans={savedPlans}
                />
            )}
        </>
    );
}
