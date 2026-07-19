import type { Metadata } from "next";
import StorefrontHome from "@/components/storefront/storefront-home";
import { stripRichText } from "@/lib/rich-text";
import { listCategoriesWithSubCategories } from "@/services/category.service";
import { getGallerySection } from "@/services/gallery.service";
import { listProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zorune",
  description:
    "A customer-facing fashion storefront powered by your live products and categories.",
};

export default async function HomePage() {
  const [categories, gallery, products] = await Promise.all([
    listCategoriesWithSubCategories(),
    getGallerySection(),
    listProducts(),
  ]);

  const categoryItems = categories.map((category) => ({
    id: category.id,
    name: category.name,
    subcategories: category.subcategories,
  }));

  const productItems = products.slice(0, 8).map((product) => ({
    id: product.id,
    title: product.title,
    description: stripRichText(product.description),
    price: product.price,
    image: product.thumbnail ?? product.images[0] ?? null,
    imageAlt: product.title,
  }));

  const galleryItems = gallery.items.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    categoryName: item.category.name,
    href: `/categories/${item.categoryId}`,
  }));

  return (
    <StorefrontHome
      categories={categoryItems}
      galleryItems={galleryItems}
      products={productItems}
    />
  );
}
