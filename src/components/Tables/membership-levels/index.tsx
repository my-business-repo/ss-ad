import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getMembershipLevels } from "./fetch";

export async function MembershipTable({ className }: { className?: string }) {
    const data = await getMembershipLevels();

    return (
        <div
            className={cn(
                "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                    Membership Levels
                </h2>
            </div>

            <div className="overflow-x-auto">
                <Table className="min-w-[1500px]">
                    <TableHeader>
                        <TableRow className="border-none uppercase [&>th]:text-center [&>th]:text-xs [&>th]:font-bold [&>th]:text-dark dark:[&>th]:text-white">
                            <TableHead className="min-w-[50px]">ID</TableHead>
                            <TableHead className="min-w-[100px]">Name</TableHead>
                            <TableHead className="min-w-[100px]">Image</TableHead>
                            <TableHead className="min-w-[100px]">Upgrade Price</TableHead>
                            <TableHead className="min-w-[200px] !text-left">Order Information</TableHead>
                            <TableHead className="min-w-[200px] !text-left">Restrict information</TableHead>
                            <TableHead className="min-w-[200px] !text-left">Limit on the amount of cash withdrawal</TableHead>
                            <TableHead className="min-w-[150px] !text-left">Withdrawal handling fee</TableHead>
                            <TableHead className="min-w-[150px] !text-left">Automatically upgrade the number of invitees</TableHead>
                            <TableHead className="min-w-[150px] !text-left">Rebate Info</TableHead>
                            <TableHead className="min-w-[100px]">Operation</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((level) => (
                            <TableRow
                                className="text-center text-sm font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                key={level.id}
                            >
                                <TableCell>{level.id}</TableCell>
                                <TableCell>{level.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center">
                                        <Image
                                            src={level.image}
                                            alt={level.name}
                                            width={60}
                                            height={60}
                                            className="object-contain"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>{level.upgradePrice}</TableCell>

                                {/* Order Information */}
                                <TableCell className="!text-left align-top">
                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                        <p>Commission Rate: <span className="text-dark dark:text-gray-300">{level.orderInfo.commissionRate}</span></p>
                                        <p>Ratio: <span className="text-dark dark:text-gray-300">{level.orderInfo.ratio}</span></p>
                                        <p>Quantity Range: <span className="text-dark dark:text-gray-300">{level.orderInfo.quantityRange}</span></p>
                                    </div>
                                </TableCell>

                                {/* Constraints */}
                                <TableCell className="!text-left align-top">
                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                        <p>Number of orders per day: <span className="text-dark dark:text-gray-300">{level.constraints.ordersPerDay}</span></p>
                                        <p>Minimum Balance for orders: <span className="text-dark dark:text-gray-300">{level.constraints.minBalance}</span></p>
                                    </div>
                                </TableCell>

                                {/* Withdrawal */}
                                <TableCell className="!text-left align-top">
                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                        <p>Minimum: <span className="text-dark dark:text-gray-300">{level.withdrawal.min}</span></p>
                                        <p>Max: <span className="text-dark dark:text-gray-300">{level.withdrawal.max}</span></p>
                                        <p className="text-[10px] text-gray-400">{level.withdrawal.withdrawableStatus}</p>
                                    </div>
                                </TableCell>

                                {/* Fees */}
                                <TableCell className="!text-left align-top">
                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                        <p>TRC withdrawal handling fee: <span className="text-dark dark:text-gray-300">{level.fees.trc}</span></p>
                                        <p>ERC withdrawal handling fee: <span className="text-dark dark:text-gray-300">{level.fees.erc}</span></p>
                                        <p>Card withdrawal handling fee: <span className="text-dark dark:text-gray-300">{level.fees.card}</span></p>
                                    </div>
                                </TableCell>

                                {/* Auto Upgrade */}
                                <TableCell className="!text-left align-top">
                                    <span className="text-dark dark:text-white">{level.autoUpgrade.numberOfInvitees}</span>
                                </TableCell>

                                {/* Rebate */}
                                <TableCell className="!text-left align-top">
                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                        <p>Level 1: <span className="text-dark dark:text-gray-300">{level.rebateInfo.level1} Level</span></p>
                                        <p>Level 2: <span className="text-dark dark:text-gray-300">{level.rebateInfo.level2} Level</span></p>
                                        <p>Level 3: <span className="text-dark dark:text-gray-300">{level.rebateInfo.level3} %</span></p>
                                    </div>
                                </TableCell>

                                {/* Operation */}
                                <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="text-primary hover:text-primary/80">
                                            Edit
                                        </button>
                                    </div>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
