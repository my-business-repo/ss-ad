
import { db } from "@/lib/db";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EditCustomerForm } from "./_components/edit-customer-form";

export const metadata: Metadata = {
    title: "Edit Customer | NextAdmin - Next.js Dashboard Toolkit",
    description: "This is Edit Customer page for NextAdmin Dashboard Kit",
};

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditCustomerPage(props: Props) {
    const params = await props.params;
    const { id } = params;

    const customer = await db.customer.findUnique({
        where: { user_id: id },
    });

    if (!customer) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-270">
            <Breadcrumb pageName="Edit Customer" />

            <EditCustomerForm customer={customer} />
        </div>
    );
}
