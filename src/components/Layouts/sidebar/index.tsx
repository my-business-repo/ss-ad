"use client";

import { logout } from "@/actions/auth-actions";
import { useSession } from "next-auth/react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { useClickOutside } from "@/hooks/use-click-outside";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { data: session } = useSession();

  const sidebarRef = useClickOutside<HTMLElement>(() => {
    if (!isOpen && !isMobile) {
      setExpandedItems([]);
    }
  });

  const userRole = (session?.user as any)?.role || "Admin";

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

    // Uncomment the following line to enable multiple expanded items
    // setExpandedItems((prev) =>
    //   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    // );
  };

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    filteredNavData.some((section: any) => {
      return section.items.some((item: any) => {
        return item.items?.some((subItem: any) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }

            // Break the loop
            return true;
          }
        });
      });
    });
  }, [pathname]);

  const filteredNavData = NAV_DATA.map((section: any) => {
    if (userRole?.toUpperCase() !== "MODERATOR") return section;

    return {
      ...section,
      items: section.items
        .filter((item: any) => item.title !== "Admin" && item.title !== "Product")
        .map((item: any) => {
          if (item.title === "Dashboard") {
            return {
              ...item,
              items: item.items.filter((subItem: any) => subItem.title !== "Membership Levels" && subItem.title !== "Home"),
            };
          }
          return item;
        }),
    };
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          "border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-dark flex-shrink-0 whitespace-nowrap",
          isMobile ? "fixed bottom-0 top-0 z-50 overflow-hidden" : "sticky top-0 h-screen",
          isOpen ? "w-[290px]" : (isMobile ? "w-0" : "w-[90px]"),
        )}
        aria-label="Main navigation"
        aria-hidden={isMobile && !isOpen}
        inert={isMobile ? (!isOpen ? true : undefined) : undefined}
      >
        <div className={cn("flex h-full flex-col py-10", isOpen || isMobile ? "pl-[25px] pr-[7px]" : "px-3")}>
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>

                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className={cn("custom-scrollbar mt-6 flex-1 pr-3 min-[850px]:mt-10", isOpen ? "overflow-y-auto overflow-x-hidden" : "overflow-visible")}>
            {filteredNavData.map((section: any) => (
              <div key={section.label} className="mb-6">
                <h2 className={cn("mb-5 text-sm font-medium text-dark-4 dark:text-dark-6", !isOpen && !isMobile && "hidden")}>
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item: any) => (
                      <li key={item.title} className="group relative">
                        {item.items.length ? (
                          <>
                            {/* Standard Expanded view for Open Sidebar */}
                            <div className={cn(!isOpen && !isMobile && "hidden")}>
                              <MenuItem
                                isActive={item.items.some(
                                  ({ url }: any) => url === pathname,
                                )}
                                onClick={() => toggleExpanded(item.title)}
                              >
                                <item.icon
                                  className="size-6 shrink-0"
                                  aria-hidden="true"
                                />

                                <span>{item.title}</span>

                                <ChevronUp
                                  className={cn(
                                    "ml-auto transition-transform duration-200",
                                    expandedItems.includes(item.title) ? "rotate-0" : "rotate-180"
                                  )}
                                  aria-hidden="true"
                                />
                              </MenuItem>

                              {expandedItems.includes(item.title) && (
                                <ul
                                  className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                                  role="menu"
                                >
                                  {item.items.map((subItem: any) => (
                                    <li key={subItem.title} role="none">
                                      <MenuItem
                                        as="link"
                                        href={subItem.url}
                                        isActive={pathname === subItem.url}
                                      >
                                        <span>{subItem.title}</span>
                                      </MenuItem>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Flat view for Collapsed Sidebar */}
                            {!isOpen && !isMobile && (
                              <div className="space-y-2">
                                {item.items.map((subItem: any) => (
                                  <div key={subItem.title} className="group relative">
                                    <MenuItem
                                      className="flex items-center gap-3 py-3"
                                      as="link"
                                      href={subItem.url}
                                      isActive={pathname === subItem.url}
                                    >
                                      {/* Reuse parent icon or fallback icon since sub-items usually don't have one */}
                                      <item.icon
                                        className="size-6 shrink-0"
                                        aria-hidden="true"
                                      />
                                      <span className="hidden">{subItem.title}</span>
                                    </MenuItem>
                                    
                                    {/* Tooltip for collapsed mode removed: subItem titles are now visible or managed correctly without visual artifacts. */}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          (() => {
                            if (item.title === "Sign Out") {
                                return (
                                  <>
                                    <MenuItem
                                      className="flex items-center gap-3 py-3"
                                      onClick={async () => {
                                        await logout();
                                      }}
                                      isActive={false}
                                    >
                                      <item.icon
                                        className="size-6 shrink-0"
                                        aria-hidden="true"
                                      />

                                      <span className={cn(!isOpen && !isMobile && "hidden")}>{item.title}</span>
                                    </MenuItem>
                                    {/* Tooltip for collapsed mode */}
                                    {!isOpen && !isMobile && (
                                      <div className="hidden absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-xl group-hover:block dark:bg-white dark:text-gray-900 z-[9999] whitespace-nowrap before:absolute before:-left-3 before:top-0 before:h-full before:w-4 before:bg-transparent">
                                        {item.title}
                                      </div>
                                    )}
                                  </>
                                );
                              }

                              const href =
                                "url" in item
                                  ? item.url + ""
                                  : "/" +
                                  item.title.toLowerCase().split(" ").join("-");

                              return (
                                <>
                                  <MenuItem
                                    className="flex items-center gap-3 py-3"
                                    as="link"
                                    href={href}
                                    isActive={pathname === href}
                                  >
                                    <item.icon
                                      className="size-6 shrink-0"
                                      aria-hidden="true"
                                    />

                                    <span className={cn(!isOpen && !isMobile && "hidden")}>{item.title}</span>
                                  </MenuItem>
                                  {/* Tooltip for collapsed mode */}
                                  {!isOpen && !isMobile && (
                                    <div className="hidden absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-xl group-hover:block dark:bg-white dark:text-gray-900 z-[9999] whitespace-nowrap before:absolute before:-left-3 before:top-0 before:h-full before:w-4 before:bg-transparent">
                                      {item.title}
                                    </div>
                                  )}
                                </>
                              );
                            })()
                          )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
