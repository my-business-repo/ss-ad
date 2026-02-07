"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { LevelForm } from "@/components/Tables/membership-levels/LevelForm";

export default function CreateLevelPage() {
    return (
        <>
            <Breadcrumb pageName="Create New Level" />

            <div className="flex flex-col gap-10">
                <LevelForm />
            </div>
        </>
    );
}
