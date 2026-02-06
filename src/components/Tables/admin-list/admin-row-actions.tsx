"use client";

import { deleteAdmin, updateAdmin } from "@/actions/admin-actions";
import { Modal } from "@/components/ui/modal";
import { useActionState, useEffect, useState } from "react";

// Icons
function EditIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
    );
}

const initialState = {
    success: false,
    message: "",
};

export function AdminRowActions({ admin }: { admin: any }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editState, editAction, isEditPending] = useActionState(updateAdmin, initialState);

    useEffect(() => {
        if (editState.success) {
            setIsEditOpen(false);
        }
    }, [editState.success]);

    const handleDelete = async () => {
        const res = await deleteAdmin(admin.id);
        if (res.success) {
            setIsDeleteOpen(false);
        } else {
            alert(res.message);
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => setIsEditOpen(true)}
                className="hover:text-primary transition-colors p-1"
                title="Edit"
            >
                <EditIcon className="w-5 h-5 text-blue-500" />
            </button>

            <button
                onClick={() => setIsDeleteOpen(true)}
                className="hover:text-red-600 transition-colors p-1"
                title="Delete"
            >
                <TrashIcon className="w-5 h-5 text-red-500" />
            </button>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Administrator">
                <form action={editAction} className="flex flex-col gap-6 p-4">
                    {editState.message && (
                        <div className={`p-4 mb-4 text-sm rounded-lg ${editState.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                            <span className="font-medium">{editState.success ? 'Success!' : 'Error!'}</span> {editState.message}
                        </div>
                    )}
                    <input type="hidden" name="id" value={admin.id} />
                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={admin.name}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">Email</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={admin.email}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">Role</label>
                        <div className="relative z-20 bg-transparent dark:bg-dark-3">
                            <select
                                name="role"
                                defaultValue={admin.role}
                                required
                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                            >
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="ADMIN">Admin</option>
                                <option value="MODERATOR">Moderator</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">Password <span className="text-xs text-gray-500">(Leave blank to keep current)</span></label>
                        <input
                            type="password"
                            name="password"
                            placeholder="New password"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-3 dark:focus:border-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isEditPending}
                        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                    >
                        {isEditPending ? "Updating..." : "Update Admin"}
                    </button>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Deletion">
                <div className="p-6">
                    <p className="mb-6 text-black dark:text-white">Are you sure you want to delete <strong>{admin.name}</strong>? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setIsDeleteOpen(false)}
                            className="px-4 py-2 rounded border border-stroke text-black hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
