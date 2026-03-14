import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getSaveOrderPlans } from "./fetch";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { PencilSquareIcon, TrashIcon } from "@/assets/icons";
import { PreviewIcon } from "../icons";
import DeletePlanButton from "./DeleteButton";
import { TableSearchBar } from "@/components/TableSearchBar";

interface SaveOrderPlanTableProps {
    className?: string;
    page?: number;
    pageSize?: number;
    search?: string;
}

export async function SaveOrderPlanTable({ className, page = 1, pageSize = 10, search = '' }: SaveOrderPlanTableProps) {
    const { plans, total } = await getSaveOrderPlans(page, pageSize, search);
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
                    Save Order Plan List
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {Math.min(startIndex + 1, total)}-{Math.min(startIndex + pageSize, total)} of {total} plans
                </p>
            </div>

            <TableSearchBar placeholder="Search by plan name..." />

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="w-[60px] !text-center">#</TableHead>
                        <TableHead className="min-w-[150px] !text-left">Plan Name</TableHead>
                        <TableHead className="!text-center">Number of Products</TableHead>
                        <TableHead className="min-w-[150px] !text-left">Date Created</TableHead>
                        <TableHead className="!text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {plans.map((plan: any, index: number) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={plan.id}
                        >
                            <TableCell className="!text-center font-semibold text-gray-500 dark:text-gray-400">
                                {startIndex + index + 1}
                            </TableCell>

                            <TableCell className="!text-left">
                                {plan.name}
                            </TableCell>

                            <TableCell className="!text-center">
                                {plan.itemCount}
                            </TableCell>

                            <TableCell className="!text-left min-w-fit">
                                {new Date(plan.createdAt).toLocaleString()}
                            </TableCell>

                            <TableCell className="!text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/save-order-plan/${plan.id}`}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Detail"
                                    >
                                        <PreviewIcon />
                                    </Link>
                                    <Link
                                        href={`/save-order-plan/${plan.id}/edit`}
                                        className="text-green-500 hover:text-green-700"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon />
                                    </Link>
                                    <DeletePlanButton planId={plan.id} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {plans.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                                No saved order plans found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/save-order-plan"
            />
        </div>
    );
}
