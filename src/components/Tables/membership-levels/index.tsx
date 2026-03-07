"use client";

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
import Link from "next/link";
import { getMembershipLevels, MembershipLevel } from "./fetch";
import { useState, useEffect } from "react";
import { deleteLevel } from "@/actions/membership-levels";
import { useRouter } from "next/navigation";

export function MembershipTable({ className }: { className?: string }) {
    const [data, setData] = useState<MembershipLevel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const levels = await getMembershipLevels();
            setData(levels);
        } catch (error) {
            console.error("Failed to fetch levels", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this level?")) {
            const res = await deleteLevel(id);
            if (res.success) {
                // Refresh data
                fetchData();
                router.refresh();
            } else {
                alert(res.error || "Failed to delete level");
            }
        }
    };

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
                <Link
                    href="/membership-levels/new"
                    className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
                >
                    <svg
                        className="fill-current"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M15 7H9V1C9 0.447715 8.55228 0 8 0C7.44772 0 7 0.447715 7 1V7H1C0.447715 7 0 7.44772 0 8C0 8.55228 0.447715 9 1 9H7V15C7 15.5523 7.44772 16 8 16C8.55228 16 9 15.5523 9 15V9H15C15.5523 9 16 8.5523 16 8C16 7.44772 15.5523 7 15 7Z"
                            fill=""
                        />
                    </svg>
                    Create New Level
                </Link>
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center py-8">No membership levels found.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((level: any) => (
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
                                            <p>Level 1: <span className="text-dark dark:text-gray-300">{level.rebateInfo.level1}</span></p>
                                            <p>Level 2: <span className="text-dark dark:text-gray-300">{level.rebateInfo.level2}</span></p>
                                            <p>Level 3: <span className="text-dark dark:text-gray-300">{level.rebateInfo.level3}</span></p>
                                        </div>
                                    </TableCell>

                                    {/* Operation */}
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/membership-levels/${level.id}/edit`} className="text-primary hover:text-primary/80">
                                                <svg className="fill-current w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z"></path>
                                                </svg>
                                            </Link>
                                            <button onClick={() => handleDelete(level.dbId)} className="text-red hover:text-red/80">
                                                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7285C12.8816 17.5219 13.8379 16.6219 13.8941 15.4688L14.3441 6.1594C14.8785 5.9344 15.2441 5.42815 15.2441 4.8094V3.96565C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.041C10.1816 1.74377 10.2941 1.85627 10.2941 1.9969V2.47502H7.67852V1.9969ZM10.266 15.75H7.70664C7.45352 15.75 7.25664 15.5532 7.25664 15.3V8.80315C7.25664 8.55002 7.45352 8.35315 7.70664 8.35315H10.266C10.5191 8.35315 10.716 8.55002 10.716 8.80315V15.3C10.716 15.5532 10.5191 15.75 10.266 15.75ZM12.4316 15.4407C12.4035 15.9188 12.0121 16.2844 11.534 16.2844H6.44098C5.96286 16.2844 5.57145 15.9188 5.54332 15.4407L5.12145 6.3H12.8535L12.4316 15.4407ZM13.9785 4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.21914C4.07852 5.0344 3.99414 4.9219 3.99414 4.8094V3.99377C3.99414 3.85315 4.10664 3.74065 4.21914 3.74065H13.7535C13.866 3.74065 13.9785 3.85315 13.9785 3.99377V4.8094Z" fill="" />
                                                </svg>
                                            </button>
                                        </div>
                                    </TableCell>

                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
