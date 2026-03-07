import { db } from "@/lib/db";

export type CustomerListItem = {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    status: string;
    lastLogin: string;
    balance: number;
    profit: number;
};

export async function getCustomers(page: number = 1, pageSize: number = 10, search: string = ''): Promise<{ customers: CustomerListItem[], total: number }> {
    const skip = (page - 1) * pageSize;

    const where = search ? {
        OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { user_id: { contains: search } }
        ]
    } : {};

    const [customers, total] = await Promise.all([
        db.customer.findMany({
            where,
            include: {
                accounts: true,
            },
            skip,
            take: pageSize,
            orderBy: {
                createdAt: "desc",
            },
        }),
        db.customer.count({ where })
    ]);

    return {
        customers: customers.map((customer: any) => {
            // Calculate total balance and profit from all accounts
            const totalBalance = customer.accounts.reduce((sum: any, account: any) => sum + account.balance, 0);
            const totalProfit = customer.accounts.reduce((sum: any, account: any) => sum + account.profit, 0);

            return {
                id: customer.user_id,
                name: customer.name,
                email: customer.email,
                phoneNumber: customer.phoneNumber || "N/A",
                // Capitalize first letter for UI consistency if needed, or just pass as is.
                // The previous mock had "Active", schema has "active".
                status: customer.status.charAt(0).toUpperCase() + customer.status.slice(1),
                lastLogin: customer.createdAt.toLocaleDateString(), // Mapping createdAt to "Last Login" field for now
                balance: totalBalance,
                profit: totalProfit,
            };
        }),
        total
    };
}
