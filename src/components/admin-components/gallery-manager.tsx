"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GallerySectionDTO } from "@/types";
import CategorySearchSelect from "@/components/admin-components/category-search-select";

type CategoryOption = {
  id: string;
  name: string;
};

type GalleryManagerProps = {
  categories: CategoryOption[];
  initialGallery: GallerySectionDTO;
};

type NoticeState = {
  type: "success" | "error";
  message: string;
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

const readImageDimensions = (file: File) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image dimensions."));
    };

    image.src = objectUrl;
  });

const emptyErrors = {
  imageUrl: "",
  categoryId: "",
  maxItems: "",
};

export default function GalleryManager({
  categories,
  initialGallery,
}: GalleryManagerProps) {
  const [gallery, setGallery] = useState(initialGallery);
  const [maxItems, setMaxItems] = useState(String(initialGallery.maxItems));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [errors, setErrors] = useState(emptyErrors);

  const remainingSlots = useMemo(
    () => Math.max(gallery.maxItems - gallery.items.length, 0),
    [gallery.items.length, gallery.maxItems]
  );

  const resetItemForm = () => {
    setEditingId(null);
    setSelectedCategoryId("");
    setUploadedImageUrl("");
    setPreviewUrl("");
    setErrors((current) => ({
      ...current,
      imageUrl: "",
      categoryId: "",
    }));
  };

  const uploadGalleryImage = async (file: File) => {
    const dimensions = await readImageDimensions(file);

    if (dimensions.width !== 800 || dimensions.height !== 800) {
      throw new Error("Gallery images must be exactly 800 x 800 pixels.");
    }

    const imageData = await toDataUrl(file);
    const response = await fetch("/api/uploads/gallery-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData,
        fileName: file.name,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { secureUrl?: string; error?: string }
      | null;

    if (!response.ok || !data?.secureUrl) {
      throw new Error(data?.error ?? "Failed to upload gallery image.");
    }

    return data.secureUrl;
  };

  const handleSelectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setNotice(null);
    setErrors((current) => ({ ...current, imageUrl: "" }));
    setIsUploadingImage(true);

    try {
      const secureUrl = await uploadGalleryImage(file);
      setUploadedImageUrl(secureUrl);
      setPreviewUrl(secureUrl);
    } catch (error) {
      setErrors((current) => ({
        ...current,
        imageUrl:
          error instanceof Error ? error.message : "Failed to upload image.",
      }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveSettings = async () => {
    setNotice(null);
    setErrors((current) => ({ ...current, maxItems: "" }));

    const parsed = Number(maxItems);

    if (!Number.isInteger(parsed) || parsed < 1) {
      setErrors((current) => ({
        ...current,
        maxItems: "Enter a whole number greater than 0.",
      }));
      return;
    }

    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxItems: parsed }),
      });

      const data = (await response.json().catch(() => null)) as
        | GallerySectionDTO
        | { error?: string }
        | null;

      if (!response.ok || !data || "error" in data) {
        throw new Error(
          data && "error" in data ? data.error : "Failed to update gallery."
        );
      }

      setGallery(data);
      setMaxItems(String(data.maxItems));
      setNotice({
        type: "success",
        message: "Gallery settings updated.",
      });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        maxItems:
          error instanceof Error
            ? error.message
            : "Failed to update gallery settings.",
      }));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleEditItem = (item: GallerySectionDTO["items"][number]) => {
    setNotice(null);
    setEditingId(item.id);
    setSelectedCategoryId(item.categoryId);
    setUploadedImageUrl(item.imageUrl);
    setPreviewUrl(item.imageUrl);
    setErrors((current) => ({
      ...current,
      imageUrl: "",
      categoryId: "",
    }));
  };

  const handleDeleteItem = async (id: string) => {
    setNotice(null);

    try {
      const response = await fetch(`/api/gallery-items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to delete gallery image.");
      }

      setGallery((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== id),
      }));

      if (editingId === id) {
        resetItemForm();
      }

      setNotice({
        type: "success",
        message: "Gallery image deleted.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete image.",
      });
    }
  };

  const handleSaveItem = async () => {
    setNotice(null);
    setErrors((current) => ({
      ...current,
      imageUrl: uploadedImageUrl ? "" : current.imageUrl,
      categoryId: selectedCategoryId ? "" : current.categoryId,
    }));

    let hasErrors = false;

    if (!uploadedImageUrl) {
      hasErrors = true;
      setErrors((current) => ({
        ...current,
        imageUrl: "Upload an 800 x 800 gallery image first.",
      }));
    }

    if (!selectedCategoryId) {
      hasErrors = true;
      setErrors((current) => ({
        ...current,
        categoryId: "Choose the main category for redirect.",
      }));
    }

    if (hasErrors) {
      return;
    }

    setIsSavingItem(true);

    try {
      const endpoint = editingId
        ? `/api/gallery-items/${editingId}`
        : "/api/gallery-items";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          categoryId: selectedCategoryId,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | GallerySectionDTO["items"][number]
        | { error?: string }
        | null;

      if (!response.ok || !data || "error" in data) {
        throw new Error(
          data && "error" in data ? data.error : "Failed to save gallery item."
        );
      }

      setGallery((current) => {
        const existingIndex = current.items.findIndex((item) => item.id === data.id);

        if (existingIndex >= 0) {
          const nextItems = [...current.items];
          nextItems[existingIndex] = data;
          return {
            ...current,
            items: nextItems.sort((first, second) => first.position - second.position),
          };
        }

        return {
          ...current,
          items: [...current.items, data].sort(
            (first, second) => first.position - second.position
          ),
        };
      });

      resetItemForm();
      setNotice({
        type: "success",
        message: editingId
          ? "Gallery image updated."
          : "Gallery image added and linked to its main category.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to save gallery image.",
      });
    } finally {
      setIsSavingItem(false);
    }
  };

  const canAddNewItem = gallery.items.length < gallery.maxItems || Boolean(editingId);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">Manage your gallery</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Add homepage gallery images, connect each image to a main category,
                and control how many images the section can hold.
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
              {gallery.items.length} / {gallery.maxItems} used
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Gallery image limit
              </label>
              <Input
                type="number"
                min={1}
                max={24}
                value={maxItems}
                onChange={(event) => setMaxItems(event.target.value)}
              />
              <p className="text-xs text-zinc-500">
                Default is 4 images. Increase or decrease this when needed.
              </p>
              {errors.maxItems && (
                <p className="text-xs text-red-500">{errors.maxItems}</p>
              )}
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Remaining space: <span className="font-semibold">{remainingSlots}</span>
              {" "}gallery image{remainingSlots === 1 ? "" : "s"}.
            </div>
            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
              {isSavingSettings ? "Saving..." : "Save Setting"}
            </Button>
          </div>

          {notice && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {notice.message}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              {editingId ? "Edit gallery image" : "Add gallery image"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Upload a square `800 x 800` image, then choose the main category page
              users should open after clicking it.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700">Gallery image</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center transition hover:border-zinc-400 hover:bg-zinc-100">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Gallery preview"
                  className="h-48 w-48 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-48 w-full flex-col items-center justify-center gap-3">
                  <ImagePlus className="h-8 w-8 text-zinc-400" />
                  <div className="text-sm text-zinc-500">
                    Click to upload an `800 x 800` image
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSelectImage}
              />
            </label>
            {isUploadingImage && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Uploading image...
              </div>
            )}
            {errors.imageUrl && (
              <p className="text-xs text-red-500">{errors.imageUrl}</p>
            )}
          </div>

          <CategorySearchSelect
            key={selectedCategoryId || "empty-category"}
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            options={categories}
            error={errors.categoryId}
            disabled={categories.length === 0}
          />

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetItemForm}>
              Clear
            </Button>
            <Button
              type="button"
              onClick={handleSaveItem}
              disabled={
                isSavingItem || isUploadingImage || !canAddNewItem || categories.length === 0
              }
            >
              {isSavingItem
                ? "Saving..."
                : editingId
                ? "Done"
                : "Add To Gallery"}
            </Button>
          </div>

          {!canAddNewItem && !editingId && (
            <p className="text-sm text-amber-600">
              Gallery is full. Increase the gallery image limit before adding more.
            </p>
          )}
        </section>
      </div>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Current gallery images</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Each image redirects to its selected main category page.
            </p>
          </div>
        </div>

        {gallery.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {gallery.items.map((item, index) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
              >
                <img
                  src={item.imageUrl}
                  alt={item.categoryName}
                  className="aspect-square w-full object-cover"
                />
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Image {index + 1}
                    </span>
                    <span className="text-xs text-zinc-400">Order {item.position + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Redirect to</p>
                    <p className="text-base font-semibold text-zinc-900">
                      {item.categoryName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDeleteItem(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-sm text-zinc-500">
            No gallery images yet. Add your first `800 x 800` image and link it to a
            main category to activate the homepage gallery section.
          </div>
        )}
      </section>
    </div>
  );
}
