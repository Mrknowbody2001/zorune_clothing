import { prisma } from "@/lib/prisma";
import type { GalleryItemInput, GallerySectionInput } from "@/types";

const DEFAULT_MAX_ITEMS = 4;

async function ensureGallerySection() {
  const existing = await prisma.gallerySection.findFirst({
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.gallerySection.create({
    data: {
      maxItems: DEFAULT_MAX_ITEMS,
    },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getGallerySection() {
  return ensureGallerySection();
}

export async function updateGallerySection(data: GallerySectionInput) {
  const section = await ensureGallerySection();

  if (data.maxItems < section.items.length) {
    throw new Error(
      `Gallery already has ${section.items.length} image(s). Delete some images before lowering the limit.`
    );
  }

  return prisma.gallerySection.update({
    where: { id: section.id },
    data: {
      maxItems: data.maxItems,
    },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function createGalleryItem(data: GalleryItemInput) {
  const section = await ensureGallerySection();

  if (section.items.length >= section.maxItems) {
    throw new Error(
      `Gallery limit reached. Increase the gallery image limit above ${section.maxItems} to add more images.`
    );
  }

  const nextPosition =
    data.position ??
    (section.items.length > 0
      ? Math.max(...section.items.map((item) => item.position)) + 1
      : 0);

  return prisma.galleryItem.create({
    data: {
      imageUrl: data.imageUrl,
      categoryId: data.categoryId,
      position: nextPosition,
      gallerySectionId: section.id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getGalleryItemById(id: string) {
  if (!id) {
    throw new Error("Gallery item id is required.");
  }

  return prisma.galleryItem.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      gallerySection: true,
    },
  });
}

export async function updateGalleryItem(
  id: string,
  data: Partial<GalleryItemInput>
) {
  if (!id) {
    throw new Error("Gallery item id is required.");
  }

  return prisma.galleryItem.update({
    where: { id },
    data,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function deleteGalleryItem(id: string) {
  if (!id) {
    throw new Error("Gallery item id is required.");
  }

  const existing = await prisma.galleryItem.findUnique({
    where: { id },
    select: {
      id: true,
      gallerySectionId: true,
    },
  });

  if (!existing) {
    throw new Error("Gallery item not found.");
  }

  const [, remainingItems] = await prisma.$transaction([
    prisma.galleryItem.delete({
      where: { id },
    }),
    prisma.galleryItem.findMany({
      where: {
        gallerySectionId: existing.gallerySectionId,
      },
      orderBy: { position: "asc" },
      select: {
        id: true,
      },
    }),
  ]);

  await Promise.all(
    remainingItems.map((item, index) =>
      prisma.galleryItem.update({
        where: { id: item.id },
        data: {
          position: index,
        },
      })
    )
  );

  return { ok: true };
}
