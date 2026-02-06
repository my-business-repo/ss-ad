"use client";

import { updatePassword } from "@/actions/user-actions";
import { useActionState } from "react";

const initialState = {
    success: false,
    message: "",
};

export function ChangePasswordForm() {
    const [state, formAction, isPending] = useActionState(updatePassword, initialState);

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-dark-3 dark:bg-dark-2">
            <div className="border-b border-stroke py-4 px-7 dark:border-dark-3">
                <h3 className="font-medium text-black dark:text-white">
                    Change Password
                </h3>
            </div>
            <div className="p-7">
                <form action={formAction}>
                    {state.message && (
                        <div className={`p-4 mb-4 text-sm rounded-lg ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                            <span className="font-medium">{state.success ? 'Success!' : 'Error!'}</span> {state.message}
                        </div>
                    )}

                    <div className="mb-5.5">
                        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            placeholder="Current Password"
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-5.5">
                        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-5.5">
                        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                            Re-type New Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Re-type New Password"
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-4.5">
                        <button
                            className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
