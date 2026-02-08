'use client';

import { useState } from "react";
import { approveDeposit, rejectDeposit } from "@/actions/depositActions";
import { useRouter } from "next/navigation";

interface DepositActionsProps {
    transactionId: number;
    adminId: number;
}

export function DepositActions({ transactionId, adminId }: DepositActionsProps) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this deposit?')) {
            return;
        }

        setIsProcessing(true);
        const result = await approveDeposit(transactionId, adminId);

        if (result.success) {
            alert('Deposit approved successfully!');
            router.refresh();
        } else {
            alert(`Error: ${result.error}`);
        }
        setIsProcessing(false);
    };

    const handleReject = async () => {
        setIsProcessing(true);
        const result = await rejectDeposit(transactionId, adminId, rejectReason);

        if (result.success) {
            alert('Deposit rejected successfully!');
            setShowRejectModal(false);
            router.refresh();
        } else {
            alert(`Error: ${result.error}`);
        }
        setIsProcessing(false);
    };

    return (
        <>
            <div className="flex gap-3">
                <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing...' : 'Approve'}
                </button>
                <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reject
                </button>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-dark">
                        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
                            Reject Deposit
                        </h3>
                        <p className="mb-4 text-sm text-dark-4 dark:text-dark-6">
                            Please provide a reason for rejecting this deposit:
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="mb-4 w-full rounded-md border border-stroke bg-transparent px-4 py-3 text-dark outline-none focus:border-primary dark:border-strokedark dark:text-white"
                            rows={4}
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                disabled={isProcessing}
                                className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-dark hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-boxdark-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
