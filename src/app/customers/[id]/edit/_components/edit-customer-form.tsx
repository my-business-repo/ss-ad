"use client";

import { updateCustomerInfo, resetCustomerPassword } from "@/actions/customer-actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface EditCustomerFormProps {
    customer: any;
}

export const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ customer }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Basic Info State
    const [name, setName] = useState(customer.name);
    const [status, setStatus] = useState(customer.status);
    const [email, setEmail] = useState(customer.email);
    const [phoneNumber, setPhoneNumber] = useState(customer.phoneNumber || "");
    const [infoMessage, setInfoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password State
    const [newLoginPassword, setNewLoginPassword] = useState("");
    const [newFundPassword, setNewFundPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setInfoMessage(null);

        startTransition(async () => {
            const result = await updateCustomerInfo(customer.user_id, {
                name,
                status,
                email,
                phoneNumber,
            });

            if (result.success) {
                setInfoMessage({ type: 'success', text: result.message });
                router.refresh();
            } else {
                setInfoMessage({ type: 'error', text: result.message });
            }
        });
    };

    const handleResetPassword = async (type: 'login' | 'fund') => {
        setPasswordMessage(null);
        const password = type === 'login' ? newLoginPassword : newFundPassword;

        if (!password) {
            setPasswordMessage({ type: 'error', text: "Password cannot be empty" });
            return;
        }

        startTransition(async () => {
            const result = await resetCustomerPassword(customer.user_id, password, type);

            if (result.success) {
                setPasswordMessage({ type: 'success', text: result.message });
                if (type === 'login') setNewLoginPassword("");
                else setNewFundPassword("");
            } else {
                setPasswordMessage({ type: 'error', text: result.message });
            }
        });
    };

    return (
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
            <div className="flex flex-col gap-9">
                {/* Basic Info Form */}
                <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                        <h3 className="font-medium text-dark dark:text-white">
                            Edit Customer Information
                        </h3>
                    </div>
                    <form onSubmit={handleUpdateInfo}>
                        <div className="p-6.5">
                            <div className="mb-4.5">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            <div className="mb-4.5">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            <div className="mb-4.5">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            <div className="mb-4.5">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                    Status
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-dark-2">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                    <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                                        <svg
                                            className="fill-current"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill=""
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {infoMessage && (
                                <div className={`mb-4 rounded-md border p-4 ${infoMessage.type === 'success'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-red-500 bg-red-50 text-red-700'
                                    }`}>
                                    {infoMessage.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="flex flex-col gap-9">
                {/* Security Settings */}
                <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                        <h3 className="font-medium text-dark dark:text-white">
                            Security Settings
                        </h3>
                    </div>
                    <div className="p-6.5">
                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                Reset Login Password
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="New Password"
                                    value={newLoginPassword}
                                    onChange={(e) => setNewLoginPassword(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                />
                                <button
                                    onClick={() => handleResetPassword('login')}
                                    disabled={isPending}
                                    className="whitespace-nowrap rounded bg-primary px-6 py-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                Reset Fund Password
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="New Fund Password"
                                    value={newFundPassword}
                                    onChange={(e) => setNewFundPassword(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                />
                                <button
                                    onClick={() => handleResetPassword('fund')}
                                    disabled={isPending}
                                    className="whitespace-nowrap rounded bg-primary px-6 py-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {passwordMessage && (
                            <div className={`mt-4 rounded-md border p-4 ${passwordMessage.type === 'success'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-red-500 bg-red-50 text-red-700'
                                }`}>
                                {passwordMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
