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

export async function CustomerTable({ className }: { className?: string }) {
    const data = await getCustomers();

    return (
        <div
            className={cn(
                "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Customer List
            </h2>

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="min-w-[100px] !text-left">User ID</TableHead>
                        <TableHead className="min-w-[120px] !text-left">Name</TableHead>
                        <TableHead className="!text-left">Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="!text-right">Joined</TableHead>
                        <TableHead className="!text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((customer: any) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={customer.id}
                        >
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

                            <TableCell className="!text-right">
                                {customer.lastLogin}
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
                </TableBody>
            </Table>
        </div>
    );
}
