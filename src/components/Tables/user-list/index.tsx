import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getUsers } from "./fetch";

export async function UserTable({ className }: { className?: string }) {
    const data = await getUsers();

    return (
        <div
            className={cn(
                "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                User List
            </h2>

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="min-w-[120px] !text-left">Name</TableHead>
                        <TableHead className="!text-left">Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="!text-right">Last Login</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((user) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={user.id}
                        >
                            <TableCell className="!text-left min-w-fit">
                                {user.name}
                            </TableCell>

                            <TableCell className="!text-left">
                                {user.email}
                            </TableCell>

                            <TableCell>{user.role}</TableCell>

                            <TableCell>
                                <span
                                    className={cn(
                                        "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                                        user.status === "Active"
                                            ? "bg-green-100 text-green-800"
                                            : user.status === "Inactive"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                    )}
                                >
                                    {user.status}
                                </span>
                            </TableCell>

                            <TableCell className="!text-right">
                                {user.lastLogin}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
