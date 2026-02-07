"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateLevel } from "@/actions/membership-levels";

interface LevelFormProps {
    initialData?: any; // We can improve this type later
    isEdit?: boolean;
    levelId?: number; // Internal ID for updates
}

export function LevelForm({ initialData, isEdit, levelId }: LevelFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        level_id: "",
        upgradePrice: "",
        icon: null as File | null,

        // Order Info
        commissionRate: "",
        minBalanceRatio: "",
        maxBalanceRatio: "",
        minProductCount: "1",
        maxProductCount: "1",
        dailyOrderLimit: "",
        minBalanceToAcceptOrder: "",

        // Withdrawal Info
        minWithdrawalAmount: "",
        maxWithdrawalAmount: "",
        dailyWithdrawalCount: "",

        // Fees
        trcWithdrawalFee: "",
        trcWithdrawalRate: "",
        ercWithdrawalFee: "",
        ercWithdrawalRate: "",
        bankWithdrawalFee: "",
        bankWithdrawalRate: "",

        // Upgrade & Refer
        autoUpgradeInviteCount: "",
        referralCommissionRateL1: "",
        referralCommissionRateL2: "",
        referralCommissionRateL3: "",
    });

    // Existing Image URL for preview in Edit mode
    const [existingIcon, setExistingIcon] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                level_id: initialData.level_id?.toString() || "",
                upgradePrice: initialData.upgradePrice?.toString() || "",
                icon: null,

                // Order Info
                commissionRate: initialData.commissionRate?.toString() || "",
                minBalanceRatio: initialData.minBalanceRatio?.toString() || "",
                maxBalanceRatio: initialData.maxBalanceRatio?.toString() || "",
                minProductCount: initialData.minProductCount?.toString() || "1",
                maxProductCount: initialData.maxProductCount?.toString() || "1",
                dailyOrderLimit: initialData.dailyOrderLimit?.toString() || "",
                minBalanceToAcceptOrder: initialData.minBalanceToAcceptOrder?.toString() || "",

                // Withdrawal Info
                minWithdrawalAmount: initialData.minWithdrawalAmount?.toString() || "",
                maxWithdrawalAmount: initialData.maxWithdrawalAmount?.toString() || "",
                dailyWithdrawalCount: initialData.dailyWithdrawalCount?.toString() || "",

                // Fees
                trcWithdrawalFee: initialData.trcWithdrawalFee?.toString() || "",
                trcWithdrawalRate: initialData.trcWithdrawalRate?.toString() || "",
                ercWithdrawalFee: initialData.ercWithdrawalFee?.toString() || "",
                ercWithdrawalRate: initialData.ercWithdrawalRate?.toString() || "",
                bankWithdrawalFee: initialData.bankWithdrawalFee?.toString() || "",
                bankWithdrawalRate: initialData.bankWithdrawalRate?.toString() || "",

                // Upgrade & Refer
                autoUpgradeInviteCount: initialData.autoUpgradeInviteCount?.toString() || "",
                referralCommissionRateL1: initialData.referralCommissionRateL1?.toString() || "",
                referralCommissionRateL2: initialData.referralCommissionRateL2?.toString() || "",
                referralCommissionRateL3: initialData.referralCommissionRateL3?.toString() || "",
            });
            setExistingIcon(initialData.icon);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, icon: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    data.append(key, value as string | Blob);
                }
            });

            if (isEdit && levelId) {
                // Server Action
                // We need to pass the FormData, but server actions called directly need arguments matching signature
                // Or we can use bind. For now, let's wrap it.
                const result = await updateLevel(levelId, {}, data);
                if (result.error) throw new Error(result.error);
            } else {
                // API Route (Create)
                const res = await fetch("/api/v1/admin/membership-levels/create", {
                    method: "POST",
                    body: data,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to create level");
                }
            }

            // Success
            router.push("/membership-levels");
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg bg-white p-8 shadow-default dark:bg-gray-dark md:p-10">
            <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
                {isEdit ? "Edit Level" : "Level Details"}
            </h2>

            {error && (
                <div className="mb-4 rounded bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">

                {/* Basic Info */}
                <div className="col-span-2 space-y-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <h3 className="mb-2 text-lg font-semibold dark:text-white">Basic Information</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium dark:text-white">Level Name (e.g. VIP3)</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium dark:text-white">Level ID (Unique Number)</label>
                            <input
                                type="number"
                                name="level_id"
                                required
                                value={formData.level_id}
                                onChange={handleChange}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium dark:text-white">Upgrade Price ($)</label>
                            <input
                                type="number"
                                name="upgradePrice"
                                value={formData.upgradePrice}
                                onChange={handleChange}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium dark:text-white">Level Icon (R2 Upload)</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        />
                        {existingIcon && !formData.icon && (
                            <div className="mt-2 text-sm text-gray-500">
                                Current Icon: <a href={existingIcon} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Info */}
                <div className="space-y-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <h3 className="mb-2 text-lg font-semibold dark:text-white">Order Settings</h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Commission Rate (Decimal, e.g. 0.005 for 0.5%)</label>
                            <input type="number" step="0.0001" name="commissionRate" value={formData.commissionRate} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">Min Balance Ratio</label>
                                <input type="number" step="0.01" name="minBalanceRatio" value={formData.minBalanceRatio} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" placeholder="0.60" />
                            </div>
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">Max Balance Ratio</label>
                                <input type="number" step="0.01" name="maxBalanceRatio" value={formData.maxBalanceRatio} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" placeholder="1.00" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">Min Products</label>
                                <input type="number" name="minProductCount" value={formData.minProductCount} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">Max Products</label>
                                <input type="number" name="maxProductCount" value={formData.maxProductCount} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Daily Order Limit</label>
                            <input type="number" name="dailyOrderLimit" value={formData.dailyOrderLimit} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Min Balance to Accept Order</label>
                            <input type="number" name="minBalanceToAcceptOrder" value={formData.minBalanceToAcceptOrder} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                    </div>
                </div>

                {/* Withdrawal Info */}
                <div className="space-y-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <h3 className="mb-2 text-lg font-semibold dark:text-white">Withdrawal Limits</h3>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">Min Withdrawal</label>
                                <input type="number" name="minWithdrawalAmount" value={formData.minWithdrawalAmount} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">Max Withdrawal</label>
                                <input type="number" name="maxWithdrawalAmount" value={formData.maxWithdrawalAmount} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Daily Withdrawal Count</label>
                            <input type="number" name="dailyWithdrawalCount" value={formData.dailyWithdrawalCount} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                    </div>
                </div>

                {/* Fees */}
                <div className="space-y-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <h3 className="mb-2 text-lg font-semibold dark:text-white">Withdrawal Fees</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">TRC Fee (Fixed)</label>
                            <input type="number" step="0.01" name="trcWithdrawalFee" value={formData.trcWithdrawalFee} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">TRC Rate (%)</label>
                            <input type="number" step="0.01" name="trcWithdrawalRate" value={formData.trcWithdrawalRate} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">ERC Fee (Fixed)</label>
                            <input type="number" step="0.01" name="ercWithdrawalFee" value={formData.ercWithdrawalFee} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">ERC Rate (%)</label>
                            <input type="number" step="0.01" name="ercWithdrawalRate" value={formData.ercWithdrawalRate} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Bank Fee (Fixed)</label>
                            <input type="number" step="0.01" name="bankWithdrawalFee" value={formData.bankWithdrawalFee} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Bank Rate (%)</label>
                            <input type="number" step="0.01" name="bankWithdrawalRate" value={formData.bankWithdrawalRate} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                    </div>
                </div>

                {/* Referral & Upgrade */}
                <div className="space-y-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <h3 className="mb-2 text-lg font-semibold dark:text-white">Referral & Upgrade</h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Auto Upgrade Invite Count</label>
                            <input type="number" name="autoUpgradeInviteCount" value={formData.autoUpgradeInviteCount} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">L1 Comm. (Decimal)</label>
                                <input type="number" step="0.001" name="referralCommissionRateL1" value={formData.referralCommissionRateL1} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" placeholder="0.10" />
                            </div>
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">L2 Comm.</label>
                                <input type="number" step="0.001" name="referralCommissionRateL2" value={formData.referralCommissionRateL2} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" placeholder="0.05" />
                            </div>
                            <div>
                                <label className="text-xs font-medium dark:text-gray-300">L3 Comm.</label>
                                <input type="number" step="0.001" name="referralCommissionRateL3" value={formData.referralCommissionRateL3} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" placeholder="0.03" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 mt-4 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded border border-stroke px-6 py-2 font-medium text-black hover:bg-gray-100 focus:outline-none dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Level" : "Create Level")}
                    </button>
                </div>
            </form>
        </div>
    );
}
