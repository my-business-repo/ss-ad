
"use client";

import React, { useState } from "react";
import { GeneralTab } from "./general-tab";
import { TransactionsTab } from "./transactions-tab";
import { OrdersTab } from "./orders-tab";
import { OrderPlansTab } from "./order-plans-tab";

interface CustomerTabsProps {
    customer: any;
    totalBalance: number;
    totalProfit: number;
    deposits: any[];
    withdrawals: any[];
    orders: any[];
    orderPlans: any[];
}

export const CustomerTabs: React.FC<CustomerTabsProps> = ({
    customer,
    totalBalance,
    totalProfit,
    deposits,
    withdrawals,
    orders,
    orderPlans,
}) => {
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        { id: "general", label: "General" },
        { id: "deposit", label: "Deposit" },
        { id: "withdraw", label: "Withdraw" },
        { id: "order", label: "Order" },
        { id: "order-plan", label: "Order Plan" },
    ];

    return (
        <>
            <div className="mb-6 flex gap-3 border-b border-stroke dark:border-strokedark">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`border-b-2 py-4 px-6 text-sm font-medium hover:text-primary ${activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-dark dark:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div>
                {activeTab === "general" && (
                    <GeneralTab
                        customer={customer}
                        totalBalance={totalBalance}
                        totalProfit={totalProfit}
                    />
                )}
                {activeTab === "deposit" && (
                    <TransactionsTab transactions={deposits} type="Deposit" />
                )}
                {activeTab === "withdraw" && (
                    <TransactionsTab transactions={withdrawals} type="Withdrawal" />
                )}
                {activeTab === "order" && (
                    <OrdersTab orders={orders} />
                )}
                {activeTab === "order-plan" && (
                    <OrderPlansTab orderPlans={orderPlans} />
                )}
            </div>
        </>
    );
};
