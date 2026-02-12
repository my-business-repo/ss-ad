
import React from 'react';

interface GeneralTabProps {
    customer: any;
    totalBalance: number;
    totalProfit: number;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ customer, totalBalance, totalProfit }) => {
    return (
        <div className="grid grid-cols-5 gap-8">
            <div className="col-span-5 xl:col-span-3">
                <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                    <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
                        <h3 className="font-medium text-dark dark:text-white">
                            Personal Information
                        </h3>
                    </div>
                    <div className="p-7">
                        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Full Name
                                </label>
                                <div className="text-dark dark:text-white font-semibold">
                                    {customer.name}
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    User ID
                                </label>
                                <div className="text-dark dark:text-white">
                                    {customer.user_id}
                                </div>
                            </div>
                        </div>

                        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Email Address
                                </label>
                                <div className="text-dark dark:text-white">
                                    {customer.email}
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Phone Number
                                </label>
                                <div className="text-dark dark:text-white">
                                    {customer.phoneNumber || "N/A"}
                                </div>
                            </div>
                        </div>

                        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Status
                                </label>
                                <div className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${customer.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}>
                                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Joined Date
                                </label>
                                <div className="text-dark dark:text-white">
                                    {customer.createdAt.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-span-5 xl:col-span-2">
                <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                    <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
                        <h3 className="font-medium text-dark dark:text-white">
                            Account Summary
                        </h3>
                    </div>
                    <div className="p-7">
                        <div className="mb-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between border-b border-stroke pb-4 dark:border-dark-3">
                                    <span className="text-dark dark:text-white">Total Balance</span>
                                    <span className="font-bold text-dark dark:text-white">${totalBalance.toFixed(10)}</span>
                                </div>
                                <div className="flex justify-between border-b border-stroke pb-4 dark:border-dark-3">
                                    <span className="text-dark dark:text-white">Total Profit</span>
                                    <span className={`font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        ${totalProfit.toFixed(10)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-dark dark:text-white">Refer Code</span>
                                    <span className="font-medium text-dark dark:text-white">{customer.referCode}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
