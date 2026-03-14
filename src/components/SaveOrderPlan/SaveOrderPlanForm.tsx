"use client";

import { createSaveOrderPlan } from "@/actions/save-order-plan";
import { useActionState, useState, useRef, useEffect } from "react";
import Select, { type SingleValue } from "react-select";

// Detect and react to dark mode class changes on <html>
function useIsDark() {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains("dark"));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);
    return isDark;
}

type Product = {
    id: number;
    name: string;
    product_id: string;
    price: number;
    commission: number;
    image: string | null;
};

type Props = {
    products: Product[];
    plan?: {
        id: number;
        name: string | null;
        items: { product: Product, sequence: number }[];
    } | null;
};

type ProductOption = {
    value: string;
    label: string;
    product: Product;
};

const initialState = { message: "" };

// Format each dropdown option: image + name + ID + price + commission
function formatOptionLabel(option: ProductOption) {
    const { product } = option;
    return (
        <div className="flex items-center gap-3 py-0.5">
            {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-8 w-8 rounded object-cover shrink-0"
                />
            ) : (
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-dark-3 shrink-0 flex items-center justify-center text-gray-400 text-xs">
                    ?
                </div>
            )}
            <div className="min-w-0">
                <p className="text-sm font-medium text-dark dark:text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {product.product_id} · ${product.price} · {product.commission}% comm.
                </p>
            </div>
        </div>
    );
}

// react-select style overrides — dark mode aware
function buildSelectStyles(isDark: boolean) {
    const bg = isDark ? "#24303f" : "#ffffff";
    const bgHover = isDark ? "#313d4a" : "#f1f5f9";
    const bgSelected = isDark ? "rgba(60,80,224,0.25)" : "rgba(60,80,224,0.1)";
    const border = isDark ? "#313d4a" : "#e2e8f0";
    const text = isDark ? "#ffffff" : "#1a1a2e";
    return {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: isDark ? "#1c2434" : "transparent",
            borderColor: state.isFocused ? "#3c50e0" : border,
            boxShadow: "none",
            "&:hover": { borderColor: "#3c50e0" },
            borderRadius: "6px",
            minHeight: "40px",
            color: text,
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: bg,
            border: `1px solid ${border}`,
            zIndex: 9999,
            borderRadius: "7px",
            overflow: "hidden",
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected
                ? bgSelected
                : state.isFocused
                    ? bgHover
                    : "transparent",
            color: text,
            cursor: "pointer",
        }),
        singleValue: (base: any) => ({ ...base, color: text }),
        input: (base: any) => ({ ...base, color: text }),
        placeholder: (base: any) => ({ ...base, color: isDark ? "#6b7280" : "#9ca3af" }),
        clearIndicator: (base: any) => ({ ...base, color: isDark ? "#9ca3af" : "#6b7280" }),
        dropdownIndicator: (base: any) => ({ ...base, color: isDark ? "#9ca3af" : "#6b7280" }),
        indicatorSeparator: (base: any) => ({ ...base, backgroundColor: border }),
        menuList: (base: any) => ({ ...base, backgroundColor: bg }),
    };
}

// Shared product slot row UI
function ProductSlot({
    index,
    selectedProduct,
    options,
    onChange,
    onRemove,
    isNew,
    slotRef,
    isDark,
}: {
    index: number;
    selectedProduct: Product | null;
    options: ProductOption[];
    onChange: (index: number, productId: string) => void;
    onRemove: (index: number) => void;
    isNew?: boolean;
    slotRef?: React.Ref<HTMLDivElement>;
    isDark: boolean;
}) {
    const selectedOption = options.find(o => o.product.id === selectedProduct?.id) ?? null;
    const styles = buildSelectStyles(isDark);

    return (
        <div
            ref={slotRef}
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-[7px] ${isNew
                    ? "border-2 border-dashed border-primary/50 bg-primary/5 dark:bg-primary/10"
                    : "border border-stroke dark:border-dark-3"
                }`}
        >
            <span className={`font-semibold w-8 shrink-0 ${isNew ? "text-primary" : "text-dark dark:text-white"}`}>
                #{index + 1}
            </span>

            <div className="flex-grow w-full">
                <Select
                    options={options}
                    value={selectedOption}
                    onChange={(opt: SingleValue<ProductOption>) =>
                        onChange(index, opt ? opt.value : "")
                    }
                    formatOptionLabel={formatOptionLabel}
                    placeholder="Search by name or product ID..."
                    isClearable
                    styles={styles}
                    classNamePrefix="rs"
                />
            </div>

            <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 shrink-0 text-sm transition"
            >
                Remove
            </button>
        </div>
    );
}

export default function SaveOrderPlanForm({ products, plan }: Props) {
    const [state, formAction, isPending] = useActionState(createSaveOrderPlan, initialState);
    const newSlotRef = useRef<HTMLDivElement>(null);
    const isDark = useIsDark();

    const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>(
        plan ? plan.items.sort((a, b) => a.sequence - b.sequence).map(item => item.product) : []
    );

    // Build react-select options list
    const options: ProductOption[] = products.map(p => ({
        value: p.id.toString(),
        label: `${p.name} ${p.product_id}`,
        product: p,
    }));

    const addProductSlot = () => {
        setSelectedProducts([...selectedProducts, null]);
        setTimeout(() => {
            newSlotRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
    };

    const removeProductSlot = (index: number) => {
        const updated = [...selectedProducts];
        updated.splice(index, 1);
        setSelectedProducts(updated);
    };

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id.toString() === productId) || null;
        const updated = [...selectedProducts];
        updated[index] = product;
        setSelectedProducts(updated);
    };

    const productIdsToSubmit = selectedProducts
        .filter((p): p is Product => p !== null)
        .map(p => p.id);

    return (
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                <h3 className="font-medium text-dark dark:text-white">
                    Create New Save Order Plan
                </h3>
            </div>

            <form action={formAction} className="p-6.5">
                {plan && <input type="hidden" name="planId" value={plan.id} />}

                <div className="mb-4.5">
                    <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                        Plan Name <span className="text-red">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={plan?.name || ""}
                        placeholder="Enter plan name (e.g., VIP Template 1)"
                        required
                        className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    />
                </div>

                <input type="hidden" name="products" value={JSON.stringify(productIdsToSubmit)} />

                <div className="mb-6">
                    <div className="mb-3 flex justify-between items-center">
                        <label className="block text-body-sm font-medium text-dark dark:text-white">
                            Products Sequence
                        </label>
                        <button
                            type="button"
                            onClick={addProductSlot}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            + Add Product Slot
                        </button>
                    </div>

                    {selectedProducts.length === 0 ? (
                        <p className="text-sm text-gray-500 mb-4">
                            No products added. Click &quot;+ Add Product Slot&quot; to begin building the plan.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {/* New empty slots at the top */}
                            {selectedProducts
                                .map((p, i) => ({ p, i }))
                                .filter(({ p }) => p === null)
                                .map(({ i: index }) => (
                                    <ProductSlot
                                        key={`new-${index}`}
                                        index={index}
                                        selectedProduct={null}
                                        options={options}
                                        onChange={handleProductSelect}
                                        onRemove={removeProductSlot}
                                        isNew
                                        slotRef={newSlotRef}
                                        isDark={isDark}
                                    />
                                ))}

                            {/* Existing filled slots in order */}
                            {selectedProducts
                                .map((p, i) => ({ p, i }))
                                .filter(({ p }) => p !== null)
                                .map(({ p: selectedProduct, i: index }) => (
                                    <ProductSlot
                                        key={index}
                                        index={index}
                                        selectedProduct={selectedProduct}
                                        options={options}
                                        onChange={handleProductSelect}
                                        onRemove={removeProductSlot}
                                        isDark={isDark}
                                    />
                                ))}
                        </div>
                    )}
                </div>

                {state?.message && (
                    <div className="mb-4 text-sm text-red-500">
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending || productIdsToSubmit.length === 0}
                    className="flex w-full justify-center rounded-[7px] bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Saving Plan..." : plan ? "Update Order Plan" : "Save Order Plan"}
                </button>
            </form>
        </div>
    );
}
