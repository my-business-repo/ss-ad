import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import StarRating from "@/components/StarRating";

import Link from "next/link";
import { ArrowLeftIcon } from "@/assets/icons";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
        notFound();
    }

    const product = await db.product.findUnique({
        where: { id },
    });

    if (!product) {
        notFound();
    }

    return (
        <>
            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/products"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark shadow-1 hover:text-primary dark:bg-gray-dark dark:text-white dark:shadow-card"
                >
                    <ArrowLeftIcon />
                </Link>
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Product Details
                </h2>
            </div>

            <Breadcrumb pageName={product.name} />

            <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                    <h3 className="font-medium text-dark dark:text-white">
                        {product.name}
                    </h3>
                </div>
                <div className="p-6.5">
                    <div className="flex flex-col gap-6 md:flex-row">
                        {/* Left Column: Image */}
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <div className="overflow-hidden rounded-lg border border-stroke dark:border-dark-3 max-h-[400px] flex items-center justify-center bg-gray-100 dark:bg-dark-2">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex h-64 w-full items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="w-full md:w-1/2 lg:w-2/3">
                            <div className="mb-4">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Product ID</label>
                                <p className="font-medium text-dark dark:text-white">{product.product_id}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Price</label>
                                    <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Commission</label>
                                    <p className="text-lg font-bold text-green-500">${product.commission.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Rating</label>
                                    <p className="font-medium text-dark dark:text-white flex items-center gap-2">
                                        <StarRating rating={product.rating} />
                                        <span className="text-sm text-gray-500">({product.rating})</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${product.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}>
                                        {product.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Description</label>
                                <p className="mt-1 text-base text-body-color dark:text-body-color-dark whitespace-pre-wrap border border-stroke dark:border-dark-3 p-3 rounded-md min-h-[100px] bg-gray-50 dark:bg-dark-2">
                                    {product.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <p>Created: {product.createdAt.toLocaleDateString()}</p>
                                <p>Last Updated: {product.updatedAt.toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
