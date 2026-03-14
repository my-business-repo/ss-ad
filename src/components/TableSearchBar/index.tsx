"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

interface FilterOption {
    label: string;
    value: string;
}

interface TableSearchBarProps {
    placeholder?: string;
    filters?: {
        key: string;
        label: string;
        options: FilterOption[];
    }[];
}

export function TableSearchBar({ placeholder = "Search...", filters = [] }: TableSearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const createQueryString = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString());
            // Reset to page 1 whenever filters change
            params.set("page", "1");
            for (const [key, value] of Object.entries(updates)) {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSearch = (value: string) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString({ search: value })}`);
        });
    };

    const handleFilter = (key: string, value: string) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString({ [key]: value })}`);
        });
    };

    return (
        <div className={`flex flex-wrap items-center gap-3 mb-5 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    defaultValue={searchParams.get("search") ?? ""}
                    placeholder={placeholder}
                    onChange={(e) => {
                        const val = e.target.value;
                        // Debounce slightly
                        const timer = setTimeout(() => handleSearch(val), 400);
                        return () => clearTimeout(timer);
                    }}
                    className="w-full rounded-[7px] border border-stroke bg-transparent py-2 pl-9 pr-4 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
            </div>

            {/* Dynamic filter dropdowns */}
            {filters.map((filter) => (
                <select
                    key={filter.key}
                    value={searchParams.get(filter.key) ?? ""}
                    onChange={(e) => handleFilter(filter.key, e.target.value)}
                    className="rounded-[7px] border border-stroke bg-transparent py-2 pl-3 pr-8 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                >
                    <option value="">{filter.label}: All</option>
                    {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ))}

            {/* Clear button - shown if any filter is active */}
            {(searchParams.get("search") || filters.some(f => searchParams.get(f.key))) && (
                <button
                    onClick={() => {
                        startTransition(() => {
                            router.push(pathname);
                        });
                    }}
                    className="text-sm text-gray-500 hover:text-red-500 transition dark:text-gray-400"
                >
                    × Clear
                </button>
            )}

            {isPending && (
                <span className="text-xs text-gray-400 dark:text-gray-500">Searching...</span>
            )}
        </div>
    );
}
