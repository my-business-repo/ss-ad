"use server";

import { db } from "@/lib/db";
import { uploadToR2 } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export type ActionState = {
    error?: string;
    success?: string;
};

export async function updateLevel(
    id: number,
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        // Extract basic fields
        const name = formData.get("name") as string;
        const level_id = parseInt(formData.get("level_id") as string);
        const upgradePrice = parseFloat(formData.get("upgradePrice") as string) || 0;

        // Extract icon
        const iconFile = formData.get("icon") as File | null;
        let iconUrl = undefined; // Undefined means no change

        if (iconFile && iconFile.size > 0) {
            iconUrl = await uploadToR2(iconFile, "levels");
        }

        // Extract Order Info
        const commissionRate = parseFloat(formData.get("commissionRate") as string) || 0;
        const minBalanceRatio = parseFloat(formData.get("minBalanceRatio") as string) || 0;
        const maxBalanceRatio = parseFloat(formData.get("maxBalanceRatio") as string) || 0;
        const minProductCount = parseInt(formData.get("minProductCount") as string) || 1;
        const maxProductCount = parseInt(formData.get("maxProductCount") as string) || 1;

        // Extract Constraints
        const dailyOrderLimit = parseInt(formData.get("dailyOrderLimit") as string) || 0;
        const minBalanceToAcceptOrder = parseFloat(formData.get("minBalanceToAcceptOrder") as string) || 0;

        // Extract Withdrawal Info
        const minWithdrawalAmount = parseFloat(formData.get("minWithdrawalAmount") as string) || 0;
        const maxWithdrawalAmount = parseFloat(formData.get("maxWithdrawalAmount") as string) || 0;
        const dailyWithdrawalCount = parseInt(formData.get("dailyWithdrawalCount") as string) || 0;

        // Extract Fees
        const trcWithdrawalFee = parseFloat(formData.get("trcWithdrawalFee") as string) || 0;
        const trcWithdrawalRate = parseFloat(formData.get("trcWithdrawalRate") as string) || 0;
        const ercWithdrawalFee = parseFloat(formData.get("ercWithdrawalFee") as string) || 0;
        const ercWithdrawalRate = parseFloat(formData.get("ercWithdrawalRate") as string) || 0;
        const bankWithdrawalFee = parseFloat(formData.get("bankWithdrawalFee") as string) || 0;
        const bankWithdrawalRate = parseFloat(formData.get("bankWithdrawalRate") as string) || 0;

        // Extract Auto Upgrade & Referral
        const autoUpgradeInviteCount = parseInt(formData.get("autoUpgradeInviteCount") as string) || 0;
        const referralCommissionRateL1 = parseFloat(formData.get("referralCommissionRateL1") as string) || 0;
        const referralCommissionRateL2 = parseFloat(formData.get("referralCommissionRateL2") as string) || 0;
        const referralCommissionRateL3 = parseFloat(formData.get("referralCommissionRateL3") as string) || 0;

        // Update Level
        await db.customerLevel.update({
            where: { id },
            data: {
                level_id,
                name,
                ...(iconUrl && { icon: iconUrl }), // Only update icon if new one uploaded
                upgradePrice,
                commissionRate,
                minBalanceRatio,
                maxBalanceRatio,
                minProductCount,
                maxProductCount,
                dailyOrderLimit,
                minBalanceToAcceptOrder,
                minWithdrawalAmount,
                maxWithdrawalAmount,
                dailyWithdrawalCount,
                trcWithdrawalFee,
                trcWithdrawalRate,
                ercWithdrawalFee,
                ercWithdrawalRate,
                bankWithdrawalFee,
                bankWithdrawalRate,
                autoUpgradeInviteCount,
                referralCommissionRateL1,
                referralCommissionRateL2,
                referralCommissionRateL3,
            },
        });

        revalidatePath("/membership-levels");
        return { success: "Membership level updated successfully" };
    } catch (error: any) {
        console.error("Error updating membership level:", error);
        if (error.code === "P2002") {
            return { error: "Level ID already exists" };
        }
        return { error: "Failed to update membership level" };
    }
}

export async function deleteLevel(id: number): Promise<ActionState> {
    try {
        await db.customerLevel.delete({
            where: { id },
        });

        revalidatePath("/membership-levels");
        return { success: "Membership level deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting membership level:", error);
        return { error: "Failed to delete membership level" };
    }
}
