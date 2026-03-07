"use client";

import { toggleNotificationReadStatus, deleteNotification } from "@/actions/notification-actions";
import { format } from "date-fns";
import { useState } from "react";

interface NotificationItemProps {
    notification: any; // Type this properly if possible
}

export function NotificationItem({ notification }: NotificationItemProps) {
    const [isRead, setIsRead] = useState(notification.isRead);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleToggleReadStatus = async () => {
        setIsLoading(true);
        const newStatus = !isRead;
        setIsRead(newStatus); // Optimistic update

        const result = await toggleNotificationReadStatus(notification.id, newStatus);
        if (!result.success) {
            setIsRead(!newStatus); // Revert on failure
        }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteNotification(notification.id);
        if (result.success) {
            setIsDeleted(true);
        } else {
            setIsDeleting(false);
        }
    };

    if (isDeleted) return null;

    return (
        <div className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRead
            ? 'bg-white border-stroke dark:bg-gray-dark dark:border-strokedark'
            : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full mt-1 ${notification.type === 'REGISTER' ? 'bg-green-100 text-green-600' :
                    notification.type === 'DEPOSIT' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'WITHDRAWAL' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-purple-100 text-purple-600'
                    }`}>
                    {notification.type === 'REGISTER' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.75 15a2.25 2.25 0 0 1 2.25-2.25h9a2.25 2.25 0 0 1 2.25 2.25v.375a.375.375 0 0 1-.375.375H4.125a.375.375 0 0 1-.375-.375V15Z" />
                        </svg>
                    )}
                    {notification.type === 'DEPOSIT' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                    )}
                    {notification.type === 'WITHDRAWAL' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                    )}
                    {notification.type === 'MESSAGE' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                    )}
                </div>
                <div>
                    <h4 className={`text-sm font-semibold ${isRead ? 'text-dark dark:text-white' : 'text-primary'}`}>
                        {notification.type}
                    </h4>
                    <p className="text-sm font-medium text-dark dark:text-white mt-1">
                        {notification.message}
                    </p>
                    <span className="text-xs text-body text-gray-500 mt-2 block">
                        {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleToggleReadStatus}
                    disabled={isLoading || isDeleting}
                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${isRead
                        ? 'border-stroke text-dark hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-gray-800'
                        : 'border-primary text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                >
                    {isLoading ? 'Updating...' : (isRead ? 'Mark as Unread' : 'Mark as Read')}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting || isLoading}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                    title="Delete Notification"
                >
                    {isDeleting ? (
                        <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
