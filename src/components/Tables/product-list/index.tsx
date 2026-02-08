import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getProducts } from "./fetch";
import { PencilSquareIcon, TrashIcon } from "@/assets/icons";
import { PreviewIcon } from "../icons";
import DeleteProductButton from "./delete-button";
import StarRating from "@/components/StarRating";
import { Pagination } from "@/components/Pagination";

interface ProductTableProps {
    className?: string;
    page?: number;
    pageSize?: number;
}

export async function ProductTable({ className, page = 1, pageSize = 10 }: ProductTableProps) {
    const { products: data, total } = await getProducts(page, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;

    return (
        <div
            className={cn(
                "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                    Product List
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {startIndex + 1}-{Math.min(startIndex + pageSize, total)} of {total} products
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="w-[60px] !text-center">#</TableHead>
                        <TableHead className="min-w-[150px] !text-left">Image</TableHead>
                        <TableHead className="min-w-[100px] !text-left">Product ID</TableHead>
                        <TableHead className="min-w-[150px] !text-left">Name</TableHead>
                        <TableHead className="!text-right">Price</TableHead>
                        <TableHead className="!text-right">Commission</TableHead>
                        <TableHead className="!text-center">Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="!text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((product: any, index: number) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={product.id}
                        >
                            <TableCell className="!text-center font-semibold text-gray-500 dark:text-gray-400">
                                {startIndex + index + 1}
                            </TableCell>

                            <TableCell className="!text-left">
                                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-500 text-xs">
                                            No Img
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell className="!text-left">
                                {product.product_id}
                            </TableCell>

                            <TableCell className="!text-left min-w-fit">
                                {product.name}
                            </TableCell>

                            <TableCell className="!text-right">
                                ${product.price.toFixed(2)}
                            </TableCell>

                            <TableCell className="!text-right">
                                {product.commission.toFixed(1)}%
                            </TableCell>

                            <TableCell className="!text-center flex justify-center py-4">
                                <StarRating rating={product.rating} />
                            </TableCell>

                            <TableCell>
                                <span
                                    className={cn(
                                        "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                                        product.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    )}
                                >
                                    {product.status}
                                </span>
                            </TableCell>

                            <TableCell className="!text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Detail"
                                    >
                                        <PreviewIcon />
                                    </Link>
                                    <Link
                                        href={`/products/${product.id}/edit`}
                                        className="text-green-500 hover:text-green-700"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon />
                                    </Link>
                                    <DeleteProductButton productId={product.id} imageUrl={product.image} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                                No products found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/products"
            />
        </div>
    );
}
