import { DotIcon } from "@/assets/icons";
import { formatMessageTime } from "@/lib/format-message-time"; // You might want to rename this or create a new date formatter
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { getRecentCustomers } from "../fetch";
import { format } from "date-fns"; // Standard date formatting if available, otherwise use what is there

export async function RecentCustomers() {
  const data = await getRecentCustomers();

  return (
    <div className="rounded-[10px] bg-white py-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h2 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark dark:text-white">
        Recent Customers
      </h2>

      <ul>
        {data.map((customer, key) => (
          <li key={key}>
            <Link
              href={`/customers/${customer.id}`} // Assuming there is a customer detail page, otherwise just / or #
              className="flex items-center gap-4.5 px-7.5 py-3 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-2 dark:focus-visible:bg-dark-2"
            >
              <div className="relative shrink-0">
                <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xl font-bold uppercase text-gray-500 dark:text-gray-300">
                  {customer.name.charAt(0)}
                </div>

                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-3.5 rounded-full ring-2 ring-white dark:ring-dark-2",
                    customer.status === 'active' ? "bg-green" : "bg-red",
                  )}
                />
              </div>

              <div className="relative flex-grow">
                <h3 className="font-medium text-dark dark:text-white">
                  {customer.name}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-medium dark:text-dark-5 xl:max-w-[8rem]",
                      "text-dark-4 dark:text-dark-6",
                    )}
                  >
                    {customer.email}
                  </span>

                  <DotIcon />

                  <time
                    className="text-xs"
                    dateTime={customer.createdAt.toISOString()}
                  >
                    {format(customer.createdAt, 'MMM d, yyyy')}
                  </time>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
