"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { updateProduct } from "@/actions/product";
import { useActionState } from "react";
import { Product } from "@prisma/client";

const initialState = {
    message: "",
};

export default function EditProductForm({ product }: { product: Product }) {
    const [state, formAction, isPending] = useActionState(updateProduct, initialState);

    return (
        <>
            <Breadcrumb pageName="Edit Product" />

            <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                    <h3 className="font-medium text-dark dark:text-white">
                        Edit Product
                    </h3>
                </div>
                <form action={formAction} className="p-6.5">
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="currentImageUrl" value={product.image || ""} />

                    <div className="mb-4.5">
                        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                            Product Name <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={product.name}
                            placeholder="Enter product name"
                            required
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                            Description <span className="text-red">*</span>
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            defaultValue={product.description}
                            placeholder="Enter product description"
                            required
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        ></textarea>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                        <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                                Price <span className="text-red">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                defaultValue={product.price}
                                placeholder="Enter price"
                                step="0.01"
                                required
                                className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                            />
                        </div>

                        <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                                Commission (%) <span className="text-red">*</span>
                            </label>
                            <input
                                type="number"
                                name="commission"
                                defaultValue={product.commission}
                                placeholder="Enter commission percentage"
                                step="0.01"
                                required
                                className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                            Rating (1-5)
                        </label>
                        <input
                            type="number"
                            name="rating"
                            defaultValue={product.rating}
                            placeholder="Enter rating (1-5)"
                            min="1"
                            max="5"
                            step="0.1"
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                            Product Image
                        </label>

                        {product.image && (
                            <div className="mb-4 w-32 h-32 overflow-hidden rounded border border-stroke">
                                <img src={product.image} alt="Current" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            className="w-full cursor-pointer rounded-[7px] border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                        />
                        <p className="mt-1 text-sm text-gray-500">Leave empty to keep current image.</p>
                    </div>

                    {state.message && (
                        <div className="mb-4 text-sm text-red-500">
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex w-full justify-center rounded-[7px] bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {isPending ? "Updating..." : "Update Product"}
                    </button>
                </form>
            </div>
        </>
    );
}
