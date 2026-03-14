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
import { getCustomers } from "./fetch";
import { PencilSquareIcon } from "@/assets/icons";
import { PreviewIcon } from "../icons";

import { CustomerDeleteButton } from "./delete-button";
import { Pagination } from "@/components/Pagination";
import { TableSearchBar } from "@/components/TableSearchBar";

interface CustomerTableProps {
    className?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    tradeable?: string;
}

export async function CustomerTable({ className, page = 1, pageSize = 10, search = '', tradeable = '' }: CustomerTableProps) {
    const { customers: data, total } = await getCustomers(page, pageSize, search, tradeable);
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
                    Customer List
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {Math.min(startIndex + 1, total)}-{Math.min(startIndex + pageSize, total)} of {total} customers
                </p>
            </div>

            <TableSearchBar
                placeholder="Search by name, email or user ID..."
                filters={[
                    {
                        key: "tradeable",
                        label: "Tradeable",
                        options: [
                            { label: "Yes", value: "true" },
                            { label: "No", value: "false" },
                        ],
                    },
                ]}
            />

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="w-[60px] !text-center">#</TableHead>
                        <TableHead className="min-w-[100px] !text-left">User ID</TableHead>
                        <TableHead className="min-w-[120px] !text-left">Name</TableHead>
                        <TableHead className="!text-left">Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="!text-center">Tradeable</TableHead>
                        <TableHead className="!text-center">Referrals</TableHead>
                        <TableHead className="!text-right">Joined</TableHead>
                        <TableHead className="!text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((customer: any, index: number) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={customer.id}
                        >
                            <TableCell className="!text-center font-semibold text-gray-500 dark:text-gray-400">
                                {startIndex + index + 1}
                            </TableCell>

                            <TableCell className="!text-left">
                                {customer.id}
                            </TableCell>

                            <TableCell className="!text-left min-w-fit">
                                {customer.name}
                            </TableCell>

                            <TableCell className="!text-left">
                                {customer.email}
                            </TableCell>

                            <TableCell>{customer.phoneNumber}</TableCell>

                            <TableCell>
                                ${customer.balance.toFixed(2)}
                            </TableCell>

                            <TableCell>
                                <span className={cn(
                                    "font-semibold",
                                    customer.profit >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    ${customer.profit.toFixed(2)}
                                </span>
                            </TableCell>

                            <TableCell>
                                <span
                                    className={cn(
                                        "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                                        customer.status === "Active"
                                            ? "bg-green-100 text-green-800"
                                            : customer.status === "Inactive"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                    )}
                                >
                                    {customer.status}
                                </span>
                            </TableCell>

                            <TableCell className="!text-center">
                                <span
                                    className={cn(
                                        "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                                        customer.tradeable
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                                    )}
                                >
                                    {customer.tradeable ? "Yes" : "No"}
                                </span>
                            </TableCell>

                            <TableCell className="!text-right">
                                {customer.lastLogin}
                            </TableCell>

                            <TableCell className="!text-center">
                                <span className="inline-flex items-center gap-1 font-medium">
                                    {customer.referralCount >= 1 && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className={customer.referralCount >= 1 ? "text-green-600" : ""}>
                                        {customer.referralCount}
                                    </span>
                                </span>
                            </TableCell>

                            <TableCell className="!text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/customers/${customer.id}`} className="text-blue-500 hover:text-blue-700" title="Detail">
                                        <PreviewIcon />
                                    </Link>
                                    <Link href={`/customers/${customer.id}/edit`} className="text-green-500 hover:text-green-700" title="Edit">
                                        <PencilSquareIcon />
                                    </Link>
                                    <CustomerDeleteButton
                                        customerId={customer.id}
                                        customerName={customer.name}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center py-8">
                                No customers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/customers"
            />
        </div>
    );
}
