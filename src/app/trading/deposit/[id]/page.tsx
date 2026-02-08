import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDepositById } from "@/actions/depositActions";
import { DepositActions } from "@/components/Trading/DepositActions";
import { auth } from "@/auth";

export default async function DepositDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params in Next.js 15+
    const { id } = await params;
    const depositId = parseInt(id);

    if (isNaN(depositId)) {
        notFound();
    }

    // Fetch the specific deposit transaction using server action
    const deposit = await getDepositById(depositId);

    if (!deposit) {
        notFound();
    }

    // Get admin session
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : 1; // Default to 1 if no session

    return (
        <>
            <Breadcrumb pageName="Deposit Detail" />

            <div className="flex flex-col gap-6">
                {/* Back Button */}
                <div>
                    <Link
                        href="/trading/deposit"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to Deposits
                    </Link>
                </div>

                {/* Approve/Reject Buttons - Only show for PENDING deposits */}
                {deposit.status === 'PENDING' && (
                    <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card">
                        <DepositActions transactionId={deposit.id} adminId={adminId} />
                    </div>
                )}

                {/* Deposit Details Card */}
                <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <h2 className="mb-6 text-body-2xlg font-bold text-dark dark:text-white">
                        Deposit Transaction Details
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
                                    {deposit.transaction_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Type</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {deposit.type}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Amount</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                    ${deposit.amount.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Status</p>
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${deposit.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : deposit.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        : deposit.status === 'REJECTED'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                    {deposit.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Created Date</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {new Date(deposit.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {deposit.processedAt && (
                                <div>
                                    <p className="text-sm text-dark-4 dark:text-dark-6">Processed Date</p>
                                    <p className="text-base font-medium text-dark dark:text-white">
                                        {new Date(deposit.processedAt).toLocaleString()}
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
                                    {deposit.account.customer.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Customer Email</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {deposit.account.customer.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Customer ID</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {deposit.account.customer.user_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Account ID</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {deposit.account.account_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Account Balance</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    ${deposit.account.balance.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-dark-4 dark:text-dark-6">Account Status</p>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {deposit.account.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    {deposit.adminNote && (
                        <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
                            <h3 className="text-lg font-semibold text-dark dark:text-white mb-3">
                                Admin Notes
                            </h3>
                            <div className="rounded-md bg-gray-2 dark:bg-boxdark-2 p-4">
                                <p className="text-base text-dark dark:text-white">
                                    {deposit.adminNote}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Proof of Payment */}
                    {deposit.proofImageUrl && (
                        <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
                            <h3 className="text-lg font-semibold text-dark dark:text-white mb-3">
                                Proof of Payment
                            </h3>
                            <div className="relative w-full max-w-md">
                                <a
                                    href={deposit.proofImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Image
                                        src={deposit.proofImageUrl}
                                        alt="Proof of Payment"
                                        width={400}
                                        height={400}
                                        className="rounded-md border border-stroke dark:border-strokedark object-cover hover:opacity-80 transition-opacity"
                                    />
                                </a>
                                <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
                                    Click image to view full size
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
