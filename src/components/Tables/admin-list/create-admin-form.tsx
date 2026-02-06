"use client";

import { useActionState, useEffect, useState } from "react";
import { createAdmin } from "@/actions/admin-actions";
import { Modal } from "@/components/ui/modal";

// Reusing or creating a simple Plus icon if not available
function AddIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

const initialState = {
    success: false,
    message: "",
};


export function CreateAdminForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createAdmin, initialState);

    useEffect(() => {
        if (state.success) {
            setIsOpen(false);
            // Reset logic could be here if needed, or keyed reset
        }
    }, [state.success]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-green-600 py-4 px-10 text-center font-medium text-white hover:bg-green-700 lg:px-8 xl:px-10"
            >
                <span>
                    <AddIcon className="h-5 w-5" />
                </span>
                Create Admin
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Administrator">
                <form action={formAction} className="flex flex-col gap-6 p-4">
                    {state.message && (
                        <div className={`p-4 mb-4 text-sm rounded-lg ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                            <span className="font-medium">{state.success ? 'Success!' : 'Error!'}</span> {state.message}
                        </div>
                    )}

                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">
                            Role
                        </label>
                        <div className="relative z-20 bg-transparent dark:bg-dark-3">
                            <select
                                name="role"
                                required
                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                            >
                                <option value="" disabled selected>Select Role</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="ADMIN">Admin</option>
                                <option value="MODERATOR">Moderator</option>
                            </select>
                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                <svg
                                    className="fill-current"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                        fill=""
                                    ></path>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                    >
                        {isPending ? "Creating..." : "Create Admin"}
                    </button>
                </form>
            </Modal>
        </>
    );
}
