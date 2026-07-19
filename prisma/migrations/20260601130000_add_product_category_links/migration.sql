ALTER TABLE "Product"
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "subCategoryId" TEXT;

UPDATE "Product"
SET
  "categoryId" = fallback."categoryId",
  "subCategoryId" = fallback."id"
FROM (
  SELECT DISTINCT ON ("categoryId")
    "id",
    "categoryId"
  FROM "SubCategory"
  ORDER BY "categoryId", "createdAt" ASC
) AS fallback
WHERE "Product"."categoryId" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Product"
    WHERE "categoryId" IS NULL OR "subCategoryId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Every product must be assigned to a category and subcategory before this migration can complete.';
  END IF;
END $$;

ALTER TABLE "Product"
ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "subCategoryId" SET NOT NULL;

CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_subCategoryId_idx" ON "Product"("subCategoryId");

ALTER TABLE "Product"
ADD CONSTRAINT "Product_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_subCategoryId_fkey"
FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
