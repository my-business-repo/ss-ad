import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProductTable } from "@/components/Tables/product-list";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function ProductListPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;

    return (
        <>
            <Breadcrumb pageName="Product List" />

            <div className="flex flex-col gap-10">
                <ProductTable page={page} pageSize={10} />
            </div>
        </>
    );
}
