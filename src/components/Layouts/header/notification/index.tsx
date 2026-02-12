"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BellIcon } from "./icons";
import { getRecentNotifications, markNotificationAsRead } from "@/actions/notification-actions";
import { format } from "date-fns";

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await getRecentNotifications(5);
    if (result.success) {
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every minute or listen to realtime events if possible
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await markNotificationAsRead(id);
    // Re-fetch to be sure? No, optimistic is enough for dropdown.
  };

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (open) {
          // Re-fetch when opening to get fresh data
          fetchNotifications();
        }
      }}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[22rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {loading ? (
            <li className="p-4 text-center text-sm text-gray-500">Loading...</li>
          ) : notifications.length === 0 ? (
            <li className="p-4 text-center text-sm text-gray-500">No notifications</li>
          ) : (
            notifications.map((item) => (
              <li key={item.id} role="menuitem">
                <Link
                  href="/notifications" // Go to notifications page on click
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-4 rounded-lg px-2 py-2 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3 ${!item.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className={`shrink-0 rounded-full p-2 mt-1 ${item.type === 'REGISTER' ? 'bg-green-100 text-green-600' :
                      item.type === 'DEPOSIT' ? 'bg-blue-100 text-blue-600' :
                        item.type === 'WITHDRAWAL' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-purple-100 text-purple-600'
                    }`}>
                    {item.type === 'REGISTER' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125H6a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H6.75" /></svg>
                    )}
                    {item.type === 'DEPOSIT' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    )}
                    {item.type === 'WITHDRAWAL' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
                    )}
                    {item.type === 'MESSAGE' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <strong className="block text-sm font-medium text-dark dark:text-white">
                      {item.type}
                    </strong>

                    <span className="block text-xs font-medium text-dark-5 dark:text-dark-6 line-clamp-2">
                      {item.message}
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-1">
                      {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(e, item.id)}
                      className="shrink-0 text-xs text-primary hover:underline"
                      title="Mark as read"
                    >
                      Mark Read
                    </button>
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/notifications"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          See all notifications
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
