'use client';

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { getProducts, ProductListItem } from "@/components/Tables/product-list/fetch";
import { updateOrderProduct } from "@/actions/order-plan";
import { SearchIcon } from "@/assets/icons";
import { useDebouncedCallback } from "use-debounce";
// Assuming we have this, or standard button
// If Button component doesn't exist, I'll use standard HTML button or check available components.
// I'll assume standard HTML button for now to be safe, or check components/ui/button.
// Let's use standard HTML buttons styled with Tailwind.

type EditOrderModalProps = {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    currentProductName: string;
    currentProductImage: string | null;
};

export function EditOrderModal({ isOpen, onClose, orderId, currentProductName, currentProductImage }: EditOrderModalProps) {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSearch = useDebouncedCallback(async (term: string) => {
        setLoading(true);
        try {
            const { products } = await getProducts(1, 5, term);
            setProducts(products);
        } catch (error) {
            console.error("Failed to search products", error);
        } finally {
            setLoading(false);
        }
    }, 300);

    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setSelectedProduct(null);
            handleSearch(""); // Initial fetch
        }
    }, [isOpen]);

    const handleUpdate = async () => {
        if (!selectedProduct) return;
        setSubmitting(true);
        try {
            const res = await updateOrderProduct(orderId, selectedProduct.id);
            if (res.success) {
                onClose();
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error("Update failed", error);
            alert("Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Order Product"
        >
            <div className="grid gap-4 py-4">
                {/* Current Product */}
                <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                        {currentProductImage ? (
                            <img src={currentProductImage} alt={currentProductName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No Img</div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Current Product</p>
                        <p className="font-medium text-dark dark:text-white">{currentProductName}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search replacement product..."
                        className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-10 pr-4 text-sm outline-none focus:border-primary dark:border-gray-600 dark:text-white"
                        onChange={(e) => {
                            setSearch(e.target.value);
                            handleSearch(e.target.value);
                        }}
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <SearchIcon className="h-4 w-4" />
                    </div>
                </div>

                {/* Product List */}
                <div className="h-[300px] overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
                    {loading ? (
                        <div className="flex h-full items-center justify-center p-4 text-sm text-gray-500">Loading...</div>
                    ) : products.length > 0 ? (
                        <div className="space-y-1 p-2">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedProduct?.id === product.id ? "bg-primary/5 ring-1 ring-primary" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-dark dark:text-white">{product.name}</p>
                                            <p className="text-xs text-gray-500">${product.price.toFixed(2)} | Comm: {product.commission.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    {selectedProduct?.id === product.id && (
                                        <span className="text-xs font-semibold text-primary">Selected</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center p-4 text-sm text-gray-500">No products found</div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={submitting || !selectedProduct}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Updating..." : "Replace Product"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
