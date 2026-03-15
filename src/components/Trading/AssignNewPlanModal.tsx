"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { createNewOrderPlan } from "@/actions/order-plan";
import { useRouter } from "next/navigation";

type SavedPlanOption = {
    id: number;
    name: string | null;
    _count: { items: number };
};

interface AssignNewPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: number | null;
    savedPlans: SavedPlanOption[];
}

export function AssignNewPlanModal({ isOpen, onClose, customerId, savedPlans }: AssignNewPlanModalProps) {
    const router = useRouter();
    const [creationType, setCreationType] = useState<'random' | 'saved'>('random');
    const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
        if (!customerId) return;
        if (creationType === 'saved' && !selectedPlanId) return;

        setIsApplying(true);
        try {
            const result = await createNewOrderPlan(
                customerId, 
                creationType, 
                creationType === 'saved' ? Number(selectedPlanId) : undefined
            );
            
            if (result.success) {
                onClose();
                setSelectedPlanId("");
                setCreationType('random');
                router.refresh();
            } else {
                alert(result.error || "Failed to assign new order plan.");
            }
        } catch (error) {
            console.error("Error applying new plan", error);
            alert("An error occurred while assigning the plan.");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign New Order Plan">
            <div className="py-4">
                <p className="mb-4 text-sm text-gray-500">
                    Create a new Order Plan for this customer.
                </p>

                <div className="mb-6 flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="creationType"
                            value="random"
                            checked={creationType === 'random'}
                            onChange={() => setCreationType('random')}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-dark dark:text-white">Randomize 40 Orders</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="creationType"
                            value="saved"
                            checked={creationType === 'saved'}
                            onChange={() => setCreationType('saved')}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-dark dark:text-white">Use Saved Template</span>
                    </label>
                </div>

                {creationType === 'saved' && (
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
                )}

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
                        disabled={isApplying || (creationType === 'saved' && !selectedPlanId)}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isApplying ? "Creating..." : "Create Plan"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
