import { db } from "@/lib/db";

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    user_id: string;
    referCode: string;
    createdAt: Date;
};

export async function getAdmins(): Promise<AdminUser[]> {
    const admins = await db.admin.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            user_id: true,
            referCode: true,
            createdAt: true,
        }
    });
    return admins;
}
