
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { LevelForm } from "@/components/Tables/membership-levels/LevelForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface EditLevelPageProps {
    params: {
        id: string; // This corresponds to level_id in URL, but we need to find the internal ID
    };
}

export default async function EditLevelPage({ params }: EditLevelPageProps) {
    // In Next.js 15, params must be awaited if it's a promise, though here it's typed as object.
    // Let's add logging to see what's happening.
    const resolvedParams = await params;
    const levelId = parseInt(resolvedParams.id);

    console.log("EditLevelPage: URL ID:", resolvedParams.id, "Parsed ID:", levelId);

    if (isNaN(levelId)) {
        console.log("EditLevelPage: Invalid ID -> 404");
        notFound();
    }

    const level = await db.customerLevel.findUnique({
        where: {
            level_id: levelId,
        },
    });

    console.log("EditLevelPage: Database Result for level_id", levelId, ":", level ? "Found" : "Not Found");

    if (!level) {
        notFound();
    }

    return (
        <>
            <Breadcrumb pageName="Edit Level" />

            <div className="flex flex-col gap-10">
                <LevelForm initialData={level} isEdit={true} levelId={level.id} />
            </div>
        </>
    );
}
