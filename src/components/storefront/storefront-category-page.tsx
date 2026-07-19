/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

type SubCategoryItem = {
  id: string;
  name: string;
};

type ProductItem = {
  id: string;
  title: string;
  price: number;
  image: string | null;
  categoryName: string;
  subCategoryName: string;
};

type StorefrontCategoryPageProps = {
  activeSubCategoryId: string | null;
  basePath: string;
  categoryName: string;
  products: ProductItem[];
  subcategories: SubCategoryItem[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 2,
});

function formatPrice(price: number) {
  return currency.format(price);
}

export default function StorefrontCategoryPage({
  activeSubCategoryId,
  basePath,
  categoryName,
  products,
  subcategories,
}: StorefrontCategoryPageProps) {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#201714]">
      <section className="border-b border-[#e7d8cb] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.82),_rgba(247,243,238,0.92)_42%,_#f2e7dd_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.32em] text-[#9f775a] transition hover:text-[#6f4a32]"
          >
            Back to Home
          </Link>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#a67b5b]">
                Main Category
              </p>
              <h1 className="font-heading mt-3 text-5xl tracking-[-0.04em] text-[#241813] sm:text-6xl">
                {categoryName}
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#6e574b]">
              Browse all sub categories under {categoryName} and keep moving
              between them with the menu below.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-[#e7d8cb] bg-[#f7f3ee]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            <Link
              href={basePath}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeSubCategoryId === null
                  ? "bg-[#241813] text-white"
                  : "border border-[#decec0] bg-white text-[#5f4b3f] hover:border-[#bd9779] hover:text-[#241813]"
              }`}
            >
              All
            </Link>

            {subcategories.map((subcategory) => {
              const href = `${basePath}/${subcategory.id}`;
              const isActive = activeSubCategoryId === subcategory.id;

              return (
                <Link
                  key={subcategory.id}
                  href={href}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#9f6f4d] text-white shadow-[0_12px_24px_rgba(116,79,54,0.18)]"
                      : "border border-[#decec0] bg-white text-[#5f4b3f] hover:border-[#bd9779] hover:bg-[#fff9f4] hover:text-[#241813]"
                  }`}
                >
                  {subcategory.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#a67b5b]">
              {activeSubCategoryId ? "Sub Category View" : "Full Collection"}
            </p>
            <h2 className="font-heading mt-3 text-4xl tracking-[-0.03em] text-[#241813] sm:text-5xl">
              {products.length} item{products.length === 1 ? "" : "s"} available
            </h2>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[1.7rem] border border-[#e9ddd1] bg-white shadow-[0_16px_40px_rgba(97,71,51,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(97,71,51,0.14)]"
              >
                <div className="bg-[#efe2d6]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-sm uppercase tracking-[0.28em] text-[#826451]">
                      Product Image
                    </div>
                  )}
                </div>
                <div className="space-y-2 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9d7457]">
                    {product.subCategoryName}
                  </p>
                  <h3 className="text-lg font-semibold text-[#241813]">
                    {product.title}
                  </h3>
                  <p className="text-sm font-medium text-[#8d6245]">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#d6c7b8] bg-white/70 p-8 text-sm leading-7 text-[#6e574b]">
            No products are assigned to this view yet. Add products in admin and they
            will appear here automatically.
          </div>
        )}
      </section>
    </main>
  );
}
