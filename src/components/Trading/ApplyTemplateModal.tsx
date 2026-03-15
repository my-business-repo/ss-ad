"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { applySavedPlanToOrderPlan } from "@/actions/order-plan";

type SavedPlanOption = {
    id: number;
    name: string | null;
    _count: { items: number };
};

interface ApplyTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId: number;
    savedPlans: SavedPlanOption[];
}

export function ApplyTemplateModal({ isOpen, onClose, planId, savedPlans }: ApplyTemplateModalProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
        if (!selectedPlanId) return;

        if (!confirm("Are you sure? This will permanently delete ALL orders in this plan (including completed ones) and completely replace the plan with this template.")) {
            return;
        }

        setIsApplying(true);
        try {
            const result = await applySavedPlanToOrderPlan(planId, Number(selectedPlanId));
            if (result.success) {
                onClose();
                setSelectedPlanId(""); // Reset
            } else {
                alert(result.error || "Failed to apply template.");
            }
        } catch (error) {
            console.error("Error applying template", error);
            alert("An error occurred while applying the template.");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Apply Saved Plan Template">
            <div className="py-4">
                <p className="mb-4 text-sm text-gray-500">
                    Select a template to completely replace this Order Plan.
                    <strong className="block mt-2 text-red-500">Warning: This will overwrite ALL orders in this plan and reset its progress to 0.</strong>
                </p>

                <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Choose Template
                    </label>
                    <select
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : "")}
                        disabled={isApplying || savedPlans.length === 0}
                        className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-black"
                    >
                        <option value="" disabled>Select a saved plan...</option>
                        {savedPlans.map(plan => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name} ({plan._count.items} products)
                            </option>
                        ))}
                    </select>
                    {savedPlans.length === 0 && (
                        <p className="mt-2 text-sm text-red-500">No saved plans available. Create one first.</p>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isApplying}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={isApplying || !selectedPlanId}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isApplying ? "Applying..." : "Apply Template"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
