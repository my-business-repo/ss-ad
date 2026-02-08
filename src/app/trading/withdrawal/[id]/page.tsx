import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getWithdrawalById } from "@/actions/withdrawalActions";
import { WithdrawalActions } from "@/components/Trading/WithdrawalActions";
import { auth } from "@/auth";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function WithdrawalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params in Next.js 15+
    const { id } = await params;
    const withdrawalId = parseInt(id);

    if (isNaN(withdrawalId)) {
        notFound();
    }

    // Fetch the specific withdrawal transaction using server action
    const withdrawal = await getWithdrawalById(withdrawalId);

    if (!withdrawal) {
        notFound();
    }

    // Get admin session
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : 1; // Default to 1 if no session

    return (
        <>
            <Breadcrumb pageName="Withdrawal Detail" />

            <div className="flex flex-col gap-6">
                {/* Back Button */}
                <div>
                    <Link
                        href="/trading/withdrawal"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to Withdrawals
                    </Link>
                </div>

                {/* Approve/Reject Buttons - Only show for PENDING withdrawals */}
                {withdrawal.status === 'PENDING' && (
                    <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card">
                        <WithdrawalActions transactionId={withdrawal.id} adminId={adminId} />
                    </div>
                )}

                {/* Withdrawal Details Card */}
                <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <h2 className="mb-6 text-body-2xlg font-bold text-dark dark:text-white">
                        Withdrawal Transaction Details
                    </h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Transaction Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-dark dark:text-white border-b border-stroke dark:border-strokedark pb-2">
                                Transaction Information
                            </h3>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Transaction ID</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {withdrawal.transaction_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Type</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {withdrawal.type}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Amount</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                    ${withdrawal.amount.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Withdrawal Address</p>
                                <p className="text-base font-medium text-dark dark:text-white break-all">
                                    {withdrawal.address || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Status</p>
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${withdrawal.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : withdrawal.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        : withdrawal.status === 'REJECTED'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                    {withdrawal.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Created Date</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {new Date(withdrawal.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {withdrawal.processedAt && (
                                <div>
                                    <p className="text-sm text-dark-4 dark:text-dark-6">Processed Date</p>
                                    <p className="text-base font-medium text-dark dark:text-white">
                                        {new Date(withdrawal.processedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Customer & Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-dark dark:text-white border-b border-stroke dark:border-strokedark pb-2">
                                Customer & Account
                            </h3>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Customer Name</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {withdrawal.account.customer.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Customer Email</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {withdrawal.account.customer.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Customer ID</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {withdrawal.account.customer.user_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Account ID</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {withdrawal.account.account_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Account Balance</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    ${withdrawal.account.balance.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Account Status</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {withdrawal.account.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    {withdrawal.adminNote && (
                        <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
                            <h3 className="text-lg font-semibold text-dark dark:text-white mb-3">
                                Admin Notes
                            </h3>
                            <div className="rounded-md bg-gray-2 dark:bg-boxdark-2 p-4">
                                <p className="text-base text-dark dark:text-white">
                                    {withdrawal.adminNote}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
