"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageCircle,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

type CategoryItem = {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
};

type GalleryItem = {
  id: string;
  imageUrl: string;
  categoryName: string;
  href: string;
};

type ProductItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string | null;
  imageAlt: string;
};

type StorefrontHomeProps = {
  categories: CategoryItem[];
  galleryItems: GalleryItem[];
  products: ProductItem[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 2,
});

const heroSlides = [
  {
    image: "/image/hero-banner-01.png",
    label: "New Season",
  },
  {
    image: "/image/hero-banner-02.png",
    label: "Summer Edit",
  },
  {
    image: "/image/hearo-banner-03.png",
    label: "Soft Luxury",
  },
];

function formatPrice(price: number) {
  return currency.format(price);
}

export default function StorefrontHome({
  categories,
  galleryItems,
  products,
}: StorefrontHomeProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(products.length > 0);
  const newArrivalsRef = useRef<HTMLDivElement | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const effectiveExpandedCategoryId = categories.some(
    (category) => category.id === expandedCategoryId
  )
    ? expandedCategoryId
    : (categories[0]?.id ?? null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const container = newArrivalsRef.current;

    if (!container) {
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products.length]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryId((current) =>
      current === categoryId ? null : categoryId
    );
  };

  const scrollNewArrivals = (direction: "left" | "right") => {
    const container = newArrivalsRef.current;

    if (!container) {
      return;
    }

    const amount = Math.max(container.clientWidth * 0.82, 320);
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#201714]">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="flex items-center justify-between px-7 py-6 text-white lg:px-10">
          <button
            type="button"
            className="inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.28em] text-white"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <div className="font-heading text-4xl tracking-[0.12em] sm:text-5xl">
            Zorune
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {[User, ShoppingBag, MessageCircle].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/18"
              >
                <Icon className="h-4.5 w-4.5" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm">
          <div className="h-full w-full max-w-sm overflow-y-auto bg-[#f8f3ed] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#9d7457]">
                  Browse Menu
                </p>
                <h2 className="font-heading mt-2 text-3xl text-[#241813]">
                  Zorune
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dccfc2] bg-white text-[#2c1d17]"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((category) => {
                const expanded = effectiveExpandedCategoryId === category.id;

                return (
                  <div key={category.id} className="border-b border-[#e7d8cb]/85 pb-2">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="flex w-full items-center justify-between py-4 text-left text-[#241813] transition-colors hover:text-[#8d6245]"
                    >
                      <span className="text-base font-semibold text-[#241813]">
                        {category.name}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#8d6245] transition duration-300 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {category.subcategories.length > 0 ? (
                          <div className="space-y-1.5 pb-2 pl-2">
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/categories/${category.id}/${subcategory.id}`}
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#604d42] transition-colors hover:bg-[#f6eee7] hover:text-[#2f211b]"
                                onClick={() => setMenuOpen(false)}
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="pb-2 pl-2 text-sm text-[#7a6558]">
                            No sub categories yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <section className="relative">
        <div className="relative h-[78vh] min-h-[35rem] w-full sm:h-[88vh]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-700 ${
                activeSlide === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.label}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.14)_35%,rgba(0,0,0,0.22)_100%)]" />
              <div className="absolute inset-x-0 bottom-16 flex justify-center px-6">
                <Link
                  href={categories[0] ? `/categories/${categories[0].id}` : "/"}
                  className="inline-flex min-w-40 items-center justify-center bg-white px-9 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#201612] shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:bg-[#f8efe8]"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}

          <div className="absolute inset-x-0 bottom-5 flex items-center justify-between px-5 text-white sm:px-8">
            <div className="flex items-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === index ? "w-10 bg-white" : "w-2 bg-white/50"
                  }`}
                  aria-label={`Open ${slide.label}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveSlide(
                    (current) => (current - 1 + heroSlides.length) % heroSlides.length
                  )
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/10 backdrop-blur transition hover:bg-black/20"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveSlide((current) => (current + 1) % heroSlides.length)
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/10 backdrop-blur transition hover:bg-black/20"
                aria-label="Next banner"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#a67b5b]">
              New Arrivals
            </p>
            <h2 className="font-heading mt-3 text-4xl tracking-[-0.03em] text-[#241813] sm:text-5xl">
              Just landed
            </h2>
          </div>
        </div>

        <div className="relative">
          {products.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => scrollNewArrivals("left")}
                disabled={!canScrollLeft}
                className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbcdbf] bg-white/95 text-[#241813] shadow-[0_14px_34px_rgba(63,43,27,0.16)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 sm:inline-flex"
                aria-label="Scroll new arrivals left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div
                ref={newArrivalsRef}
                className="scrollbar-none flex gap-4 overflow-x-auto scroll-smooth pb-4 sm:px-8"
              >
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="w-[17.5rem] min-w-[17.5rem] flex-none overflow-hidden rounded-[1.7rem] border border-[#e9ddd1] bg-white shadow-[0_16px_40px_rgba(97,71,51,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(97,71,51,0.14)]"
                  >
                    <div className="relative bg-[#efe2d6]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.imageAlt}
                          className="h-80 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-80 items-center justify-center text-sm uppercase tracking-[0.28em] text-[#826451]">
                          Product Image
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-4">
                      <h3 className="text-base font-semibold text-[#241813]">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-[#8d6245]">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollNewArrivals("right")}
                disabled={!canScrollRight}
                className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbcdbf] bg-white/95 text-[#241813] shadow-[0_14px_34px_rgba(63,43,27,0.16)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 sm:inline-flex"
                aria-label="Scroll new arrivals right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#d6c7b8] bg-white/70 p-8 text-sm leading-7 text-[#6e574b] sm:col-span-2 xl:col-span-4">
              No products yet. Add products from admin and they will appear here automatically.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 pb-16 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#a67b5b]">
              Homepage Gallery
            </p>
            <h2 className="font-heading mt-3 text-4xl tracking-[-0.03em] text-[#241813] sm:text-5xl">
              Explore by category
            </h2>
          </div>
        </div>

        {galleryItems.length > 0 ? (
          <div className="grid gap-0.5 sm:grid-cols-2 xl:grid-cols-4">
            {galleryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group overflow-hidden rounded-[1.2rem] border border-[#e7d8cb] bg-white shadow-[0_12px_28px_rgba(97,71,51,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(97,71,51,0.14)]"
              >
                <div className="overflow-hidden bg-[#efe2d6]">
                  <img
                    src={item.imageUrl}
                    alt={item.categoryName}
                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9d7457]">
                    View Collection
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#241813]">
                    {item.categoryName}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#d6c7b8] bg-white/70 p-8 text-sm leading-7 text-[#6e574b]">
            No gallery images yet. Add them from the admin dashboard and this section
            will appear automatically.
          </div>
        )}
      </section>
    </main>
  );
}
