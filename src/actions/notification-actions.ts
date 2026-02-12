"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getRecentNotifications(limit: number = 5) {
    try {
        const notifications = await db.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        const unreadCount = await db.notification.count({
            where: { isRead: false }
        });

        return { success: true, notifications, unreadCount };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, notifications: [], unreadCount: 0 };
    }
}

export async function markNotificationAsRead(id: number) {
    try {
        await db.notification.update({
            where: { id },
            data: { isRead: true }
        });
        revalidatePath("/");
        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false };
    }
}

export async function markAllNotificationsAsRead() {
    try {
        await db.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
        revalidatePath("/");
        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false };
    }
}

export async function toggleNotificationReadStatus(id: number, isRead: boolean) {
    try {
        await db.notification.update({
            where: { id },
            data: { isRead }
        });
        revalidatePath("/");
        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error toggling notification status:", error);
        return { success: false };
    }
}
