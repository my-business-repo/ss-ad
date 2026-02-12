
import React from 'react';

interface OrderPlansTabProps {
    orderPlans: any[];
}

export const OrderPlansTab: React.FC<OrderPlansTabProps> = ({ orderPlans }) => {
    return (
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
                <h3 className="font-medium text-dark dark:text-white">
                    Order Plan History
                </h3>
            </div>
            <div className="p-7">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-dark-2">
                                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-11">
                                    Plan ID
                                </th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                                    Progress
                                </th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                                    Status
                                </th>
                                <th className="px-4 py-4 font-medium text-dark dark:text-white">
                                    Started At
                                </th>
                                <th className="px-4 py-4 font-medium text-dark dark:text-white">
                                    Completed At
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderPlans.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">No order plans found</td>
                                </tr>
                            ) : (
                                orderPlans.map((plan) => (
                                    <tr key={plan.id}>
                                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-dark dark:text-white">
                                                {plan.plan_id}
                                            </h5>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                {plan.completedOrders} / {plan.totalOrders}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${plan.status === "ACTIVE"
                                                    ? "bg-success text-success"
                                                    : plan.status === "COMPLETED"
                                                        ? "bg-primary text-primary"
                                                        : "bg-danger text-danger"
                                                }`}>
                                                {plan.status}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                {new Date(plan.startedAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                            <p className="text-dark dark:text-white">
                                                {plan.completedAt ? new Date(plan.completedAt).toLocaleDateString() : "-"}
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
