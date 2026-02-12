
import React from 'react';

interface TransactionsTabProps {
    transactions: any[];
    type: "Deposit" | "Withdrawal";
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions, type }) => {
    return (
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
                <h3 className="font-medium text-dark dark:text-white">
                    {type} History
                </h3>
            </div>
            <div className="p-7">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-dark-2">
                                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-11">
                                    ID
                                </th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                                    Amount
                                </th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                                    Status
                                </th>
                                <th className="px-4 py-4 font-medium text-dark dark:text-white">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">No {type.toLowerCase()}s found</td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-dark dark:text-white">
                                                {transaction.transaction_id}
                                            </h5>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                ${transaction.amount.toFixed(2)}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${transaction.status === "APPROVED"
                                                ? "bg-success text-success"
                                                : transaction.status === "REJECTED"
                                                    ? "bg-danger text-danger"
                                                    : "bg-warning text-warning"
                                                }`}>
                                                {transaction.status}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                {transaction.createdAt.toLocaleDateString()} {transaction.createdAt.toLocaleTimeString()}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
