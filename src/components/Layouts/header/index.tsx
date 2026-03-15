"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { useClickOutside } from "@/hooks/use-click-outside";
import { globalSearch } from "@/actions/search";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useClickOutside<HTMLDivElement>(() => {
    setShowDropdown(false);
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);

    const debounceFn = setTimeout(async () => {
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceFn);
  }, [query]);

  const handleResultClick = (url: string) => {
    setShowDropdown(false);
    setQuery("");
    router.push(url);
  };

  const hasResults = results && (
    results.customers?.length > 0 ||
    results.products?.length > 0 ||
    results.orders?.length > 0 ||
    results.transactions?.length > 0 ||
    results.orderPlans?.length > 0 ||
    results.savedOrderPlans?.length > 0 ||
    results.notifications?.length > 0
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A]"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        {/* Global Search */}
        <div ref={searchContainerRef} className="relative w-full max-w-[400px]">
          <input
            type="search"
            placeholder="Search customers, products, orders..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim() !== "") {
                setShowDropdown(true);
              }
            }}
            onFocus={() => {
              if (query.trim() !== "") setShowDropdown(true);
            }}
            className="flex w-full items-center gap-3.5 rounded-full border bg-gray-2 py-3 pl-[53px] pr-5 outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary"
          />

          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 top-full mt-2 w-full max-h-[70vh] overflow-y-auto rounded-lg border border-stroke bg-white p-3 shadow-default dark:border-stroke-dark dark:bg-gray-dark md:w-[450px] ltr:right-0 rtl:left-0 z-50 custom-scrollbar flex flex-col gap-4">
              {isSearching ? (
                <div className="flex justify-center p-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : !hasResults && query.trim() !== "" ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No results found for "{query}"
                </div>
              ) : (
                <>
                  {/* Customers */}
                  {results?.customers?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Customers</h4>
                      <ul className="flex flex-col gap-1">
                        {results.customers.map((c: any) => (
                          <li key={`customer-${c.id}`}>
                            <button
                              onClick={() => handleResultClick(`/customers?search=${c.user_id}`)}
                              className="flex w-full items-center justify-between rounded hover:bg-gray-100 p-2 text-left text-sm dark:hover:bg-dark-3"
                            >
                              <span className="font-medium text-dark dark:text-white">{c.name}</span>
                              <span className="text-xs text-gray-400">ID: {c.user_id}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Products */}
                  {results?.products?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Products</h4>
                      <ul className="flex flex-col gap-1">
                        {results.products.map((p: any) => (
                          <li key={`product-${p.id}`}>
                            <button
                              onClick={() => handleResultClick(`/products?search=${p.product_id}`)}
                              className="flex w-full items-center justify-between rounded hover:bg-gray-100 p-2 text-left text-sm dark:hover:bg-dark-3"
                            >
                              <span className="font-medium text-dark dark:text-white truncate max-w-[200px]">{p.name}</span>
                              <span className="text-xs text-gray-400 truncate w-[100px] text-right">${p.price}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Orders */}
                  {results?.orders?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Orders</h4>
                      <ul className="flex flex-col gap-1">
                        {results.orders.map((o: any) => (
                          <li key={`order-${o.id}`}>
                            <button
                              onClick={() => handleResultClick(`/trading/order-list`)}
                              className="flex w-full items-center justify-between rounded hover:bg-gray-100 p-2 text-left text-sm dark:hover:bg-dark-3"
                            >
                              <span className="font-medium text-dark dark:text-white">Order {o.order_id}</span>
                              <span className="text-xs text-primary">{o.status}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Transactions */}
                  {results?.transactions?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Transactions</h4>
                      <ul className="flex flex-col gap-1">
                        {results.transactions.map((t: any) => (
                          <li key={`tx-${t.id}`}>
                            <button
                              onClick={() => handleResultClick(t.type === 'DEPOSIT' ? '/trading/deposit' : '/trading/withdrawal')}
                              className="flex w-full flex-col rounded hover:bg-gray-100 p-2 text-left text-sm dark:hover:bg-dark-3"
                            >
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-dark dark:text-white">{t.type} {t.transaction_id}</span>
                                <span className="text-xs font-bold text-dark dark:text-white">${t.amount}</span>
                              </div>
                              <span className="text-xs text-gray-400 mt-1">{t.status}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Order Plans */}
                  {results?.orderPlans?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Order Plans</h4>
                      <ul className="flex flex-col gap-1">
                        {results.orderPlans.map((op: any) => (
                          <li key={`op-${op.id}`}>
                            <button
                              onClick={() => handleResultClick(`/trading/order-plan/${op.id}`)}
                              className="flex w-full items-center justify-between rounded hover:bg-gray-100 p-2 text-left text-sm dark:hover:bg-dark-3"
                            >
                              <span className="font-medium text-dark dark:text-white">Plan {op.plan_id}</span>
                              <span className="text-xs text-primary">{op.status}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Saved Order Plans */}
                  {results?.savedOrderPlans?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Saved Order Plans</h4>
                      <ul className="flex flex-col gap-1">
                        {results.savedOrderPlans.map((sop: any) => (
                          <li key={`sop-${sop.id}`}>
                            <button
                              onClick={() => handleResultClick(`/save-order-plan`)}
                              className="flex w-full items-center justify-between rounded hover:bg-gray-100 p-2 text-left text-sm dark:hover:bg-dark-3"
                            >
                              <span className="font-medium text-dark dark:text-white truncate">{sop.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notifications */}
                  {results?.notifications?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Notifications</h4>
                      <ul className="flex flex-col gap-1">
                        {results.notifications.map((n: any) => (
                          <li key={`notif-${n.id}`}>
                            <button
                              onClick={() => handleResultClick(`/notifications`)}
                              className="flex w-full flex-col rounded hover:bg-gray-100 p-2 text-left text-sm dark:hover:bg-dark-3"
                            >
                              <span className="font-medium text-xs text-primary">{n.type}</span>
                              <span className="text-dark dark:text-gray-300 truncate mt-1">{n.message}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </>
              )}
            </div>
          )}
        </div>

        <ThemeToggleSwitch />

        <Notification />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
