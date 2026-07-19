import { prisma } from "@/lib/prisma";
import type { SubCategoryInput } from "@/types";

export async function listSubCategories() {
  return prisma.subCategory.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
    },
  });
}

export async function getSubCategoryById(id: string) {
  if (!id) {
    throw new Error("Sub category id is required.");
  }

  return prisma.subCategory.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function createSubCategory(data: SubCategoryInput) {
  return prisma.subCategory.create({ data });
}

export async function updateSubCategory(
  id: string,
  data: Partial<SubCategoryInput>
) {
  if (!id) {
    throw new Error("Sub category id is required.");
  }

  return prisma.subCategory.update({ where: { id }, data });
}

export async function deleteSubCategory(id: string) {
  if (!id) {
    throw new Error("Sub category id is required.");
  }

  return prisma.subCategory.delete({ where: { id } });
}
