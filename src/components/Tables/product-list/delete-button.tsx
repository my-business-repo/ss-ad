"use client";

import { deleteProduct } from "@/actions/product";
import { TrashIcon } from "@/assets/icons";

export default function DeleteProductButton({ productId, imageUrl }: { productId: number; imageUrl: string | null }) {
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            await deleteProduct(productId, imageUrl);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="hover:text-red-500"
            title="Delete"
        >
            <TrashIcon className="h-5 w-5" />
        </button>
    );
}
