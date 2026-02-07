import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getAdmins } from "./fetch";
import { AdminRowActions } from "./admin-row-actions";

export async function AdminTable({ className }: { className?: string }) {
    const data = await getAdmins();

    return (
        <div
            className={cn(
                "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Admin List
            </h2>

            <Table>
                <TableHeader>
                    <TableRow className="border-none uppercase [&>th]:text-center">
                        <TableHead className="min-w-[120px] !text-left">Name</TableHead>
                        <TableHead className="!text-left">Email</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Ref Code</TableHead>
                        <TableHead className="!text-right">Joined Date</TableHead>
                        <TableHead className="!text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((admin: any) => (
                        <TableRow
                            className="text-center text-base font-medium text-dark dark:text-white"
                            key={admin.id}
                        >
                            <TableCell className="!text-left min-w-fit">
                                {admin.name}
                            </TableCell>

                            <TableCell className="!text-left">
                                {admin.email}
                            </TableCell>

                            <TableCell>{admin.user_id}</TableCell>

                            <TableCell>
                                <span className={cn(
                                    "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                                    admin.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-800" :
                                        admin.role === "ADMIN" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                )}>
                                    {admin.role}
                                </span>
                            </TableCell>

                            <TableCell className="tracking-wider">{admin.referCode}</TableCell>

                            <TableCell className="!text-right">
                                {new Date(admin.createdAt).toLocaleDateString()}
                            </TableCell>

                            <TableCell>
                                <AdminRowActions admin={admin} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
