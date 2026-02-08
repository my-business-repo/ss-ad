import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { getDeposits } from "@/actions/depositActions";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function DepositPage() {
    // Fetch all deposit transactions using server action
    const deposits = await getDeposits();

    return (
        <>
            <Breadcrumb pageName="Deposit" />

            <div className="flex flex-col gap-10">
                <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                        Deposit Transactions
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                {/* <tr className="bg-gray-2 text-left dark:bg-boxdark-2"> */}
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
                                        Status
                                    </th>
                                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                                        Proof
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
                                {deposits.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-body-sm text-dark-4 dark:text-dark-6">
                                            No deposit transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    deposits.map((deposit) => (
                                        <tr key={deposit.id} className="border-b border-stroke dark:border-strokedark">
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium text-black dark:text-white">
                                                    {deposit.transaction_id}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-black dark:text-white">
                                                    {deposit.account.customer.name}
                                                </p>
                                                <p className="text-xs text-dark-4 dark:text-dark-6">
                                                    {deposit.account.customer.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-black dark:text-white">
                                                    {deposit.account.account_id}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                    ${deposit.amount.toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${deposit.status === 'APPROVED'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : deposit.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        : deposit.status === 'REJECTED'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}>
                                                    {deposit.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {deposit.proofImageUrl ? (
                                                    <a
                                                        href={deposit.proofImageUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-dark-4 dark:text-dark-6">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-black dark:text-white">
                                                    {new Date(deposit.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-dark-4 dark:text-dark-6">
                                                    {new Date(deposit.createdAt).toLocaleTimeString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/trading/deposit/${deposit.id}`}
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

