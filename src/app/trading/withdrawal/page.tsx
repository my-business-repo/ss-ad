import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { getWithdrawals } from "@/actions/withdrawalActions";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function WithdrawalPage() {
    // Fetch all withdrawal transactions using server action
    const withdrawals = await getWithdrawals();

    return (
        <>
            <Breadcrumb pageName="Withdrawal" />

            <div className="flex flex-col gap-10">
                <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                        Withdrawal Transactions
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-2 text-left dark:bg-gray-900">
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Transaction ID
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Customer
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Account ID
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Amount
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Address
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Status
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Date
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-body-sm text-dark-4 dark:text-dark-6">
                                            No withdrawal transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((withdrawal) => (
                                        <tr key={withdrawal.id} className="border-b border-stroke dark:border-strokedark">
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium text-black dark:text-white">
                                                    {withdrawal.transaction_id}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-black dark:text-white">
                                                    {withdrawal.account.customer.name}
                                                </p>
                                                <p className="text-xs text-dark-4 dark:text-dark-6">
                                                    {withdrawal.account.customer.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-black dark:text-white">
                                                    {withdrawal.account.account_id}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                    ${withdrawal.amount.toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-black dark:text-white truncate max-w-[150px]" title={withdrawal.address || ''}>
                                                    {withdrawal.address || '-'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${withdrawal.status === 'APPROVED'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : withdrawal.status === 'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            : withdrawal.status === 'REJECTED'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}>
                                                    {withdrawal.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-black dark:text-white">
                                                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-dark-4 dark:text-dark-6">
                                                    {new Date(withdrawal.createdAt).toLocaleTimeString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/trading/withdrawal/${withdrawal.id}`}
                                                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
