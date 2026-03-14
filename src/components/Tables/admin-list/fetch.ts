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

export async function getAdmins(search: string = '', role: string = ''): Promise<AdminUser[]> {
    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
            { user_id: { contains: search } },
        ];
    }
    if (role) where.role = role;

    const admins = await db.admin.findMany({
        where,
        orderBy: { createdAt: "desc" },
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
