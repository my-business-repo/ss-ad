import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProductTable } from "@/components/Tables/product-list";

export default function ProductListPage() {
    return (
        <>
            <Breadcrumb pageName="Product List" />

            <div className="flex flex-col gap-10">
                <ProductTable />
            </div>
        </>
    );
}
