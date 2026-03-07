"use client";

import { createSaveOrderPlan } from "@/actions/save-order-plan";
import { useActionState, useState } from "react";
import Image from "next/image";

type Product = {
    id: number;
    name: string;
    product_id: string;
    price: number;
    commission: number;
    image: string | null;
};

type Props = {
    products: Product[];
    plan?: {
        id: number;
        name: string | null;
        items: { product: Product, sequence: number }[];
    } | null;
};

const initialState = {
    message: "",
};

export default function SaveOrderPlanForm({ products, plan }: Props) {
    // If we have a plan, the action should be update, otherwise create.
    // For simplicity, we can pass the plan ID if it exists and let the action handle it.
    // However, server actions in next.js can be bound, but we'll use a hidden input for `planId` instead.
    const [state, formAction, isPending] = useActionState(createSaveOrderPlan, initialState);

    // Array to hold the selected products for the sequence.
    // If editing, map the sorted items back to their full product objects.
    const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>(
        plan ? plan.items.sort((a, b) => a.sequence - b.sequence).map(item => item.product) : []
    );

    const addProductSlot = () => {
        setSelectedProducts([...selectedProducts, null]);
    };

    const removeProductSlot = (index: number) => {
        const updated = [...selectedProducts];
        updated.splice(index, 1);
        setSelectedProducts(updated);
    };

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id.toString() === productId) || null;
        const updated = [...selectedProducts];
        updated[index] = product;
        setSelectedProducts(updated);
    };

    // Calculate the array of IDs to submit. Filter out any null slots.
    const productIdsToSubmit = selectedProducts
        .filter((p): p is Product => p !== null)
        .map(p => p.id);

    return (
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                <h3 className="font-medium text-dark dark:text-white">
                    Create New Save Order Plan
                </h3>
            </div>

            <form action={formAction} className="p-6.5">
                {plan && <input type="hidden" name="planId" value={plan.id} />}
                <div className="mb-4.5">
                    <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                        Plan Name <span className="text-red">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={plan?.name || ""}
                        placeholder="Enter plan name (e.g., VIP Template 1)"
                        required
                        className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    />
                </div>

                {/* Hidden input to pass product IDs as JSON payload */}
                <input type="hidden" name="products" value={JSON.stringify(productIdsToSubmit)} />

                <div className="mb-6">
                    <div className="mb-3 flex justify-between items-center">
                        <label className="block text-body-sm font-medium text-dark dark:text-white">
                            Products Sequence
                        </label>
                        <button
                            type="button"
                            onClick={addProductSlot}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            + Add Product Slot
                        </button>
                    </div>

                    {selectedProducts.length === 0 ? (
                        <p className="text-sm text-gray-500 mb-4">No products added. Click "+ Add Product Slot" to begin building the plan.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {selectedProducts.map((selectedProduct, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-stroke dark:border-dark-3 rounded-[7px]">
                                    <span className="font-semibold text-dark dark:text-white w-8 shrink-0">
                                        #{index + 1}
                                    </span>

                                    <div className="flex-grow w-full z-20 bg-transparent dark:bg-dark-2">
                                        <select
                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                                            value={selectedProduct?.id.toString() || ""}
                                            onChange={(e) => handleProductSelect(index, e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select a product...</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} (ID: {p.product_id}) - ${p.price} Let '{p.commission}%'
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeProductSlot(index)}
                                        className="text-red-500 hover:text-red-700 shrink-0"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {state?.message && (
                    <div className="mb-4 text-sm text-red-500">
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending || productIdsToSubmit.length === 0}
                    className="flex w-full justify-center rounded-[7px] bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Saving Plan..." : plan ? "Update Order Plan" : "Save Order Plan"}
                </button>
            </form>
        </div>
    );
}
