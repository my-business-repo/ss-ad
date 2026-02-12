"use client";

import { TrashIcon } from "@/assets/icons";
import { deleteCustomer } from "@/actions/customer-actions";
import { Modal } from "@/components/ui/modal";
import { useState, useTransition } from "react";

interface DeleteButtonProps {
    customerId: string;
    customerName: string;
}

export function CustomerDeleteButton({ customerId, customerName }: DeleteButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            await deleteCustomer(customerId);
            setIsOpen(false);
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Delete"
            >
                <TrashIcon />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Delete Customer"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete customer <span className="font-semibold text-dark dark:text-white">{customerName}</span>?
                        This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
