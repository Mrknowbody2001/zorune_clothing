import { prisma } from "@/lib/prisma";
import type { ProductInput } from "@/types";

async function assertValidProductClassification(data: {
  categoryId: string;
  subCategoryId: string;
}) {
  const subCategory = await prisma.subCategory.findUnique({
    where: { id: data.subCategoryId },
    select: { id: true, categoryId: true },
  });

  if (!subCategory) {
    throw new Error("Selected sub category was not found.");
  }

  if (subCategory.categoryId !== data.categoryId) {
    throw new Error("Selected sub category does not belong to the main category.");
  }
}

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function listProductsByCategory(
  categoryId: string,
  subCategoryId?: string
) {
  if (!categoryId) {
    throw new Error("Category id is required.");
  }

  return prisma.product.findMany({
    where: {
      categoryId,
      ...(subCategoryId ? { subCategoryId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getProductById(id: string) {
  if (!id) {
    throw new Error("Product id is required.");
  }

  return prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function createProduct(data: ProductInput) {
  await assertValidProductClassification(data);
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  if (!id) {
    throw new Error("Product id is required.");
  }

  if (data.categoryId || data.subCategoryId) {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: {
        categoryId: true,
        subCategoryId: true,
      },
    });

    if (!existing) {
      throw new Error("Product not found.");
    }

    await assertValidProductClassification({
      categoryId: data.categoryId ?? existing.categoryId,
      subCategoryId: data.subCategoryId ?? existing.subCategoryId,
    });
  }

  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  if (!id) {
    throw new Error("Product id is required.");
  }

  return prisma.product.delete({ where: { id } });
}
