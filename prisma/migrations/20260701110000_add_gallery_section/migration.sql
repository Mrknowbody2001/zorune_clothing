CREATE TABLE "GallerySection" (
    "id" TEXT NOT NULL,
    "maxItems" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GallerySection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "gallerySectionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GalleryItem_categoryId_idx" ON "GalleryItem"("categoryId");

CREATE INDEX "GalleryItem_gallerySectionId_position_idx" ON "GalleryItem"("gallerySectionId", "position");

ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_gallerySectionId_fkey" FOREIGN KEY ("gallerySectionId") REFERENCES "GallerySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
