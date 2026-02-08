'use client';

import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            {/* Previous Button */}
            <Link
                href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage > 1
                        ? 'bg-primary text-white hover:bg-opacity-90'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                    }`}
                onClick={(e) => currentPage <= 1 && e.preventDefault()}
            >
                Previous
            </Link>

            {/* First Page */}
            {startPage > 1 && (
                <>
                    <Link
                        href={`${baseUrl}?page=1`}
                        className="px-3 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-dark border border-stroke dark:border-strokedark hover:bg-primary hover:text-white transition"
                    >
                        1
                    </Link>
                    {startPage > 2 && (
                        <span className="px-2 text-gray-500">...</span>
                    )}
                </>
            )}

            {/* Page Numbers */}
            {pages.map((page) => (
                <Link
                    key={page}
                    href={`${baseUrl}?page=${page}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${page === currentPage
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-gray-dark border border-stroke dark:border-strokedark hover:bg-primary hover:text-white'
                        }`}
                >
                    {page}
                </Link>
            ))}

            {/* Last Page */}
            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                    )}
                    <Link
                        href={`${baseUrl}?page=${totalPages}`}
                        className="px-3 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-dark border border-stroke dark:border-strokedark hover:bg-primary hover:text-white transition"
                    >
                        {totalPages}
                    </Link>
                </>
            )}

            {/* Next Button */}
            <Link
                href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage < totalPages
                        ? 'bg-primary text-white hover:bg-opacity-90'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                    }`}
                onClick={(e) => currentPage >= totalPages && e.preventDefault()}
            >
                Next
            </Link>
        </div>
    );
}
