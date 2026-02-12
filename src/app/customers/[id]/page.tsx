
import { db } from "@/lib/db";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CustomerTabs } from "./_components/customer-tabs";

export const metadata: Metadata = {
    title: "Customer Details | NextAdmin - Next.js Dashboard Toolkit",
    description: "This is Customer Details page for NextAdmin Dashboard Kit",
};

interface Props {
    params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage(props: Props) {
    const params = await props.params;
    const { id } = params;

    const customer = await db.customer.findUnique({
        where: { user_id: id },
        include: {
            accounts: {
                include: {
                    transactions: true, // Fetch all transactions
                },
            },
            orderPlans: {
                include: {
                    orders: {
                        include: {
                            product: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            },
        },
    });

    if (!customer) {
        notFound();
    }

    const totalBalance = customer.accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalProfit = customer.accounts.reduce((sum, account) => sum + account.profit, 0);

    // Filter transactions
    const allTransactions = customer.accounts.flatMap(acc => acc.transactions).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const deposits = allTransactions.filter(t => t.type === "DEPOSIT");
    const withdrawals = allTransactions.filter(t => t.type === "WITHDRAWAL");

    // Flatten orders from orderPlans
    const allOrders = customer.orderPlans.flatMap(plan => plan.orders).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <div className="mx-auto max-w-270">
            <Breadcrumb pageName="Customer Details" />

            <CustomerTabs
                customer={customer}
                totalBalance={totalBalance}
                totalProfit={totalProfit}
                deposits={deposits}
                withdrawals={withdrawals}
                orders={allOrders}
                orderPlans={customer.orderPlans}
            />
        </div>
    );
}
