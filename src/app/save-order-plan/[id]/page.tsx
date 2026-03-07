import { db } from "@/lib/db";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { notFound } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function SaveOrderPlanDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const planId = parseInt(resolvedParams.id);

    if (isNaN(planId)) {
        notFound();
    }

    const plan = await db.savedOrderPlan.findUnique({
        where: { id: planId },
        include: {
            items: {
                include: {
                    product: true,
                },
                orderBy: {
                    sequence: "asc",
                },
            },
        },
    });

    if (!plan) {
        notFound();
    }

    return (
        <>
            <Breadcrumb pageName={plan.name || "Plan Details"} />

            <div className="grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                        {plan.name} - Products Sequence
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.items.length} Products
                    </p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="border-none uppercase [&>th]:text-center">
                            <TableHead className="w-[80px] !text-center">Sequence</TableHead>
                            <TableHead className="min-w-[150px] !text-left">Product Name</TableHead>
                            <TableHead className="min-w-[100px] !text-left">Product ID</TableHead>
                            <TableHead className="!text-right">Price</TableHead>
                            <TableHead className="!text-right">Commission</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {plan.items.map((item) => (
                            <TableRow
                                className="text-center text-base font-medium text-dark dark:text-white"
                                key={item.id}
                            >
                                <TableCell className="!text-center font-semibold text-primary">
                                    #{item.sequence}
                                </TableCell>

                                <TableCell className="!text-left flex items-center gap-3">
                                    <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex xl:w-1/2">
                                                No Img
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-semibold">{item.product.name}</span>
                                </TableCell>

                                <TableCell className="!text-left">
                                    {item.product.product_id}
                                </TableCell>

                                <TableCell className="!text-right">
                                    ${item.product.price.toFixed(2)}
                                </TableCell>

                                <TableCell className="!text-right">
                                    {item.product.commission.toFixed(1)}%
                                </TableCell>
                            </TableRow>
                        ))}
                        {plan.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    This plan is empty.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
