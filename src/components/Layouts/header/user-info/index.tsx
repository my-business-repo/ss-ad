"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react"; // Import useSession
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { logout } from "@/actions/auth-actions";

export function UserInfo() {
  const { data: session } = useSession(); // Get session data
  const [isOpen, setIsOpen] = useState(false);

  // Fallback values or explicit session data
  const userName = session?.user?.name || "Admin User";
  const userEmail = session?.user?.email || "admin@example.com";
  const userRole = (session?.user as any)?.role || "Admin"; // Cast to any if role isn't typed yet
  // Use a default placeholder if no image
  const userImg = session?.user?.image || "/images/user/user-03.png";

  // Initials for fallback if needed (though we use image src above)
  const initials = userName.substring(0, 2).toUpperCase();

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          {session?.user?.image ? (
            <Image
              src={userImg}
              className="size-12 rounded-full"
              alt={`Avatar of ${userName}`}
              role="presentation"
              width={200}
              height={200}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary dark:bg-white/10 dark:text-white">
              {initials}
            </div>
          )}

          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{userName}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          {session?.user?.image ? (
            <Image
              src={userImg}
              className="size-12 rounded-full"
              alt={`Avatar for ${userName}`}
              role="presentation"
              width={200}
              height={200}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary dark:bg-white/10 dark:text-white">
              {initials}
            </div>
          )}

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {userName}
            </div>

            <div className="leading-none text-gray-6">{userRole}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={"/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={async () => {
              await logout();
            }}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
