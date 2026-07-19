export type ProductInput = {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  subCategoryId: string;
  seoTitle?: string | null;
  seoDesc?: string | null;
  seoTags?: string | null;
  images?: string[];
  thumbnail?: string | null;
};

export type ProductDTO = {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  seoTitle: string | null;
  seoDesc: string | null;
  seoTags: string | null;
  images: string[];
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
};

export type CategoryDTO = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  subcategoryCount?: number;
};

export type CategoryWithSubCategoriesDTO = {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
};

export type SubCategoryInput = {
  name: string;
  categoryId: string;
};

export type SubCategoryDTO = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

export type GallerySectionInput = {
  maxItems: number;
};

export type GalleryItemInput = {
  imageUrl: string;
  categoryId: string;
  position?: number;
};

export type GalleryItemDTO = {
  id: string;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type GallerySectionDTO = {
  id: string;
  maxItems: number;
  items: GalleryItemDTO[];
  createdAt: string;
  updatedAt: string;
};
