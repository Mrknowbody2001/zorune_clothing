import { notFound } from "next/navigation";
import StorefrontCategoryPage from "@/components/storefront/storefront-category-page";
import { getCategoryWithSubCategories } from "@/services/category.service";
import { listProductsByCategory } from "@/services/product.service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categoryId: string; subCategoryId: string }>;
};

export default async function SubCategoryPage({ params }: PageProps) {
  const { categoryId, subCategoryId } = await params;
  const [category, products] = await Promise.all([
    getCategoryWithSubCategories(categoryId),
    listProductsByCategory(categoryId, subCategoryId),
  ]);

  if (!category) {
    notFound();
  }

  const activeSubCategory = category.subcategories.find(
    (subcategory) => subcategory.id === subCategoryId
  );

  if (!activeSubCategory) {
    notFound();
  }

  return (
    <StorefrontCategoryPage
      activeSubCategoryId={subCategoryId}
      basePath={`/categories/${category.id}`}
      categoryName={category.name}
      subcategories={category.subcategories}
      products={products.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.thumbnail ?? product.images[0] ?? null,
        categoryName: product.category.name,
        subCategoryName: product.subCategory.name,
      }))}
    />
  );
}
