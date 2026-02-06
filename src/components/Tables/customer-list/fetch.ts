import { db } from "@/lib/db";

export type CustomerListItem = {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    status: string;
    lastLogin: string;
};

export async function getCustomers(): Promise<CustomerListItem[]> {
    const customers = await db.customer.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return customers.map((customer) => ({
        id: customer.user_id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber || "N/A",
        // Capitalize first letter for UI consistency if needed, or just pass as is.
        // The previous mock had "Active", schema has "active".
        status: customer.status.charAt(0).toUpperCase() + customer.status.slice(1),
        lastLogin: customer.createdAt.toLocaleDateString(), // Mapping createdAt to "Last Login" field for now
    }));
}
