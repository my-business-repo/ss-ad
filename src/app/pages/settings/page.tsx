import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ChangePasswordForm } from "@/components/Settings/change-password-form";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";

export const metadata = {
    title: "Settings | Next.js Admin Dashboard",
    description: "This is Settings page for TailAdmin Next.js",
};

export default async function Settings() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/auth/sign-in");
    }

    const user = await db.admin.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return null;

    return (
        <>
            <div className="mx-auto max-w-270">
                <Breadcrumb pageName="Settings" />

                <div className="grid grid-cols-1 gap-8">
                    <div className="col-span-12 xl:col-span-7">
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-dark-3 dark:bg-dark-2">
                            <div className="border-b border-stroke py-4 px-7 dark:border-dark-3">
                                <h3 className="font-medium text-black dark:text-white">
                                    Personal Information
                                </h3>
                            </div>
                            <div className="p-7">
                                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                                    <div className="w-full sm:w-1/2">
                                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                            Full Name
                                        </label>
                                        <input
                                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                                            type="text"
                                            name="fullName"
                                            id="fullName"
                                            defaultValue={user.name}
                                            readOnly
                                        />
                                    </div>

                                    <div className="w-full sm:w-1/2">
                                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                            Phone Number
                                        </label>
                                        <input
                                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                                            type="text"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            placeholder="+990 3343 7865"
                                            defaultValue=""
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="mb-5.5">
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Email Address
                                    </label>
                                    <input
                                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                                        type="email"
                                        name="emailAddress"
                                        id="emailAddress"
                                        defaultValue={user.email}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-5.5">
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Username
                                    </label>
                                    <input
                                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                                        type="text"
                                        name="username"
                                        id="username"
                                        defaultValue={user.user_id}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 xl:col-span-5">
                        <ChangePasswordForm />
                    </div>
                </div>
            </div>
        </>
    );
}
