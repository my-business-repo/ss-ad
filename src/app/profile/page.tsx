
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Profile | S Admin",
    description: "Admin profile details",
};

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/auth/sign-in");
    }

    const admin = await db.admin.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (!admin) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl font-semibold text-red-500">Admin profile not found.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-10">

                {/* Left Column: Avatar & Menu */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    {/* Avatar Circle */}
                    <div className="relative mb-6">
                        <div className="h-48 w-48 rounded-full bg-warning/20 flex items-center justify-center border-4 border-white shadow-sm dark:border-dark-2 dark:bg-dark-3">
                            <span className="text-5xl font-bold text-warning dark:text-white">
                                {admin.name.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        {/* Status/Plus Button Mockup */}
                        <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-opacity-90 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-black dark:text-white mb-1">{admin.name}</h2>
                    <p className="text-dark-5 dark:text-dark-6 mb-8">{admin.role}</p>

                    {/* Navigation Mockup */}
                    <div className="w-full max-w-xs flex flex-col gap-1 text-center md:text-left">
                        <button className="py-2 px-4 text-primary font-semibold text-lg bg-transparent hover:bg-gray-2 dark:hover:bg-dark-3 rounded-md text-left transition">
                            Profile
                        </button>

                        <button className="py-2 px-4 text-dark-5 dark:text-dark-6 font-medium text-lg bg-transparent hover:bg-gray-2 dark:hover:bg-dark-3 rounded-md text-left transition">
                            Settings
                        </button>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="w-full md:w-2/3">
                    <div className="bg-white dark:bg-dark-2 rounded-lg p-6 shadow-card dark:shadow-card">
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                            Account Information
                        </h3>

                        <div className="flex flex-col gap-4">
                            {/* Detail Item: Email */}
                            <div className="flex items-center gap-4 p-4 bg-gray-1 dark:bg-dark-3 rounded-lg border border-stroke dark:border-dark-3 hover:shadow-sm transition">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-dark-2 text-primary shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-dark-5 dark:text-dark-6">Email Address</p>
                                    <p className="font-medium text-black dark:text-white sm:text-lg">{admin.email}</p>
                                </div>
                            </div>

                            {/* Detail Item: User ID */}
                            <div className="flex items-center gap-4 p-4 bg-gray-1 dark:bg-dark-3 rounded-lg border border-stroke dark:border-dark-3 hover:shadow-sm transition">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-dark-2 text-primary shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-dark-5 dark:text-dark-6">User ID</p>
                                    <p className="font-medium text-black dark:text-white sm:text-lg">{admin.user_id}</p>
                                </div>
                            </div>

                            {/* Detail Item: Referral Code */}
                            <div className="flex items-center gap-4 p-4 bg-gray-1 dark:bg-dark-3 rounded-lg border border-stroke dark:border-dark-3 hover:shadow-sm transition">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-dark-2 text-primary shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-dark-5 dark:text-dark-6">Referral Code</p>
                                    <p className="font-medium text-black dark:text-white sm:text-lg tracking-widest">{admin.referCode}</p>
                                </div>
                            </div>

                            {/* Detail Item: Joined Date */}
                            <div className="flex items-center gap-4 p-4 bg-gray-1 dark:bg-dark-3 rounded-lg border border-stroke dark:border-dark-3 hover:shadow-sm transition">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-dark-2 text-primary shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-dark-5 dark:text-dark-6">Joined Date</p>
                                    <p className="font-medium text-black dark:text-white sm:text-lg">
                                        {new Date(admin.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
