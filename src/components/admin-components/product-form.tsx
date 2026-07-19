"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/rich-text-editor";
import type { CategoryWithSubCategoriesDTO } from "@/types";
import { productCreateSchema } from "@/validations/product.schema";

const formSchema = productCreateSchema;
const MAX_IMAGES = 6;
const MAX_TAGS = 13;

type ProductFormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  productId?: string;
  categories: CategoryWithSubCategoriesDTO[];
  initialData?: ProductFormValues;
};

type ImageItem = {
  id: string;
  previewUrl: string;
  remoteUrl: string | null;
  uploading: boolean;
  error: string | null;
  localObjectUrl?: string;
};

const toOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read image."));
    };
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });

const parseTags = (raw?: string | null) =>
  (raw ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, MAX_TAGS);

export default function ProductForm({
  productId,
  categories,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragImageIndexRef = useRef<number | null>(null);
  const localObjectUrlsRef = useRef<Set<string>>(new Set());
  const productFolderRef = useRef(
    productId ?? `draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
  );
  const [images, setImages] = useState<ImageItem[]>(() =>
    (initialData?.images ?? []).map((url, index) => ({
      id: `existing-${index}-${url}`,
      previewUrl: url,
      remoteUrl: url,
      uploading: false,
      error: null,
    }))
  );
  const [seoTagsList, setSeoTagsList] = useState<string[]>(() =>
    parseTags(initialData?.seoTags)
  );
  const [tagInput, setTagInput] = useState("");
  const {
    clearErrors,
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: initialData ?? {
      title: "",
      description: "",
      price: 0,
      categoryId: "",
      subCategoryId: "",
      seoTags: "",
      images: [],
      thumbnail: null,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedSubCategoryId = watch("subCategoryId");
  const descriptionValue = watch("description");

  const availableSubCategories = useMemo(() => {
    const matchedCategory = categories.find(
      (category) => category.id === selectedCategoryId
    );

    return matchedCategory?.subcategories ?? [];
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    register("description");
  }, [register]);

  useEffect(() => {
    const objectUrls = localObjectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      if (selectedSubCategoryId) {
        setValue("subCategoryId", "");
      }
      return;
    }

    const isSubCategoryStillValid = availableSubCategories.some(
      (subCategory) => subCategory.id === selectedSubCategoryId
    );

    if (!isSubCategoryStillValid && selectedSubCategoryId) {
      setValue("subCategoryId", "");
    }
  }, [
    availableSubCategories,
    selectedCategoryId,
    selectedSubCategoryId,
    setValue,
  ]);

  const hasUploadingImages = useMemo(
    () => images.some((item) => item.uploading),
    [images]
  );

  useEffect(() => {
    if (!hasUploadingImages) {
      clearErrors("images");
    }
  }, [clearErrors, hasUploadingImages]);

  const uploadImageToCloudinary = async (file: File, itemId: string) => {
    try {
      const imageData = await toDataUrl(file);
      const response = await fetch("/api/uploads/product-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData,
          fileName: file.name,
          productFolder: productFolderRef.current,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { secureUrl?: string; error?: string }
        | null;
      const secureUrl = data?.secureUrl;

      if (!response.ok || !secureUrl) {
        const message =
          data?.error ??
          (response.ok
            ? "Missing uploaded image URL."
            : "Upload failed. Check Cloudinary settings.");
        throw new Error(message);
      }

      setImages((current) =>
        current.map((item) => {
          if (item.id !== itemId) return item;
          if (item.localObjectUrl) {
            URL.revokeObjectURL(item.localObjectUrl);
            localObjectUrlsRef.current.delete(item.localObjectUrl);
          }
          return {
            ...item,
            previewUrl: secureUrl,
            remoteUrl: secureUrl,
            uploading: false,
            error: null,
            localObjectUrl: undefined,
          };
        })
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed. Try again.";
      setImages((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                uploading: false,
                error: message,
              }
            : item
        )
      );
    }
  };

  const enqueueFiles = (selectedFiles: File[]) => {
    clearErrors("images");

    const imagesOnly = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    const remainingSlots = MAX_IMAGES - images.length;
    const filesToUse = imagesOnly.slice(0, Math.max(remainingSlots, 0));

    const nextItems: ImageItem[] = filesToUse.map((file, idx) => {
      const localObjectUrl = URL.createObjectURL(file);
      localObjectUrlsRef.current.add(localObjectUrl);
      return {
        id: `${Date.now()}-${idx}-${file.name}`,
        previewUrl: localObjectUrl,
        remoteUrl: null,
        uploading: true,
        error: null,
        localObjectUrl,
      };
    });

    if (nextItems.length === 0) return;

    setImages((current) => [...current, ...nextItems]);
    nextItems.forEach((item, index) => {
      void uploadImageToCloudinary(filesToUse[index], item.id);
    });
  };

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    enqueueFiles(selected);
    event.target.value = "";
  };

  const handleDropUpload = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      enqueueFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((current) => {
      const target = current[index];
      if (target?.localObjectUrl) {
        URL.revokeObjectURL(target.localObjectUrl);
        localObjectUrlsRef.current.delete(target.localObjectUrl);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleDragStartImage = (index: number) => {
    dragImageIndexRef.current = index;
  };

  const handleDropImage = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const sourceIndex = dragImageIndexRef.current;
    dragImageIndexRef.current = null;

    if (sourceIndex === null || sourceIndex === targetIndex) return;

    setImages((current) => {
      const cloned = [...current];
      const [moved] = cloned.splice(sourceIndex, 1);
      cloned.splice(targetIndex, 0, moved);
      return cloned;
    });
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (hasUploadingImages) {
        setError("images", {
          type: "manual",
          message: "Please wait until all image uploads are finished.",
        });
        return;
      }

      const imageUrls = images
        .filter((item) => item.remoteUrl && !item.error)
        .map((item) => item.remoteUrl as string);

      const payload = {
        ...values,
        seoTags: toOptionalString(seoTagsList.join(", ")),
        images: imageUrls,
        thumbnail: imageUrls[0] ?? null,
      };

      const parsed = formSchema.safeParse(payload);

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (!field) return;
          setError(field as keyof ProductFormValues, {
            type: "manual",
            message: issue.message,
          });
        });
        return;
      }

      const response = await fetch(
        productId ? `/api/products/${productId}` : "/api/products",
        {
          method: productId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError("title", {
          type: "manual",
          message: data?.error ?? "Failed to save. Please try again.",
        });
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Product form submit error", error);
      setError("title", {
        type: "manual",
        message: "Failed to save. Please try again.",
      });
    }
  };

  const addTag = (rawTag: string) => {
    const normalized = rawTag.trim();
    if (!normalized) return;
    if (seoTagsList.length >= MAX_TAGS) return;

    const exists = seoTagsList.some(
      (existing) => existing.toLowerCase() === normalized.toLowerCase()
    );
    if (exists) return;

    setSeoTagsList((current) => [...current, normalized]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setSeoTagsList((current) => current.filter((tag) => tag !== tagToRemove));
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Title</label>
          <Input
            {...register("title")}
            placeholder="Air Mesh Runner"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Price</label>
          <Input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            aria-invalid={Boolean(errors.price)}
          />
          {errors.price && (
            <p className="text-xs text-red-500">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Main Category</label>
          <select
            {...register("categoryId")}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">Select main category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Sub Category</label>
          <select
            {...register("subCategoryId")}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-100"
            aria-invalid={Boolean(errors.subCategoryId)}
            disabled={!selectedCategoryId || availableSubCategories.length === 0}
          >
            <option value="">
              {!selectedCategoryId
                ? "Select main category first"
                : availableSubCategories.length === 0
                ? "No sub categories available"
                : "Select sub category"}
            </option>
            {availableSubCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
          {errors.subCategoryId && (
            <p className="text-xs text-red-500">
              {errors.subCategoryId.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Description</label>
        <RichTextEditor
          value={descriptionValue}
          onChange={(nextValue) =>
            setValue("description", nextValue, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          placeholder="Lightweight running shoes built for all-day comfort."
          ariaInvalid={Boolean(errors.description)}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">SEO Tags</label>
        <p className="text-xs text-zinc-500">
          Add up to 13 tags to help search and discovery.
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={tagInput}
            placeholder="Shape, color, style, function, etc."
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addTag(tagInput);
              }
            }}
            disabled={seoTagsList.length >= MAX_TAGS}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addTag(tagInput)}
            disabled={seoTagsList.length >= MAX_TAGS || !tagInput.trim()}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {seoTagsList.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="font-semibold text-zinc-500 hover:text-zinc-800"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <span className="text-xs text-zinc-500">
            {MAX_TAGS - seoTagsList.length} left
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700">
          Product Images (max 6)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelectImages}
        />

        <div
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropUpload}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs text-zinc-500">
              Drag and drop images or click a slot to add.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
            >
              Add Images
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((item, index) => (
              <div
                key={item.id}
                draggable={!item.uploading}
                onDragStart={() => handleDragStartImage(index)}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onDrop={(event) => handleDropImage(event, index)}
                className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white"
              >
                <img
                  src={item.previewUrl}
                  alt={`Product image ${index + 1}`}
                  className="h-28 w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-black px-2 py-0.5 text-[10px] font-medium text-white">
                    Primary
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute right-2 top-2 rounded bg-white/90 p-1 text-zinc-700 hover:bg-white"
                  aria-label={`Delete image ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {item.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-medium text-white">
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Uploading...
                    </span>
                  </div>
                )}

                {item.error && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-600/90 px-2 py-1 text-[10px] text-white">
                    {item.error}
                  </div>
                )}
              </div>
            ))}

            {Array.from({ length: MAX_IMAGES - images.length }).map((_, idx) => (
              <button
                key={`empty-${idx}`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-100 text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-200"
              >
                <ImagePlus className="h-6 w-6" />
              </button>
            ))}
          </div>
        </div>

        {errors.images && (
          <p className="text-xs text-red-500">{errors.images.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            categories.length === 0 ||
            (selectedCategoryId ? availableSubCategories.length === 0 : false)
          }
        >
          {isSubmitting
            ? "Saving..."
            : productId
            ? "Update Product"
            : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
