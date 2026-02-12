import { db } from "@/lib/db";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import { NotificationItem } from "./notification-item";

export const metadata: Metadata = {
    title: "Notifications | NextAdmin - Next.js Dashboard Toolkit",
    description: "This is Notifications page for NextAdmin Dashboard Kit",
};

export default async function NotificationsPage() {
    const notifications = await db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            customer: true
        }
    });

    return (
        <div className="mx-auto max-w-270">
            <Breadcrumb pageName="Notifications" />

            <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
                    <h3 className="font-medium text-dark dark:text-white">
                        Recent Notifications
                    </h3>
                </div>
                <div className="p-7">
                    <div className="flex flex-col gap-4">
                        {notifications.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">No notifications found</div>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
