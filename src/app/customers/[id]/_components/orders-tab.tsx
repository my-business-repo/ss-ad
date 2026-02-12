
import React from 'react';

interface OrdersTabProps {
    orders: any[];
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
    return (
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
                <h3 className="font-medium text-dark dark:text-white">
                    Order History
                </h3>
            </div>
            <div className="p-7">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-dark-2">
                                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-11">
                                    Order ID
                                </th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                                    Product Name
                                </th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                                    Amount
                                </th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                                    Commission
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
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">No orders found</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-dark dark:text-white">
                                                {order.order_id}
                                            </h5>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                {order.product?.name || "Unknown Product"}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                ${order.amount.toFixed(2)}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-success">
                                                +${order.commission.toFixed(2)}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${order.status === "COMPLETED"
                                                    ? "bg-success text-success"
                                                    : order.status === "PENDING"
                                                        ? "bg-warning text-warning"
                                                        : "bg-gray-500 text-gray-500" // For other statuses like SKIPPED, NOT_START
                                                }`}>
                                                {order.status}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                {new Date(order.createdAt).toLocaleDateString()}
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
