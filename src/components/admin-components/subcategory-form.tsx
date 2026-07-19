"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subCategoryCreateSchema } from "@/validations/subcategory.schema";

const formSchema = subCategoryCreateSchema;

type SubCategoryFormValues = z.infer<typeof formSchema>;

type CategoryOption = {
  id: string;
  name: string;
};

type SubCategoryFormProps = {
  subCategoryId?: string;
  categories: CategoryOption[];
  initialData?: SubCategoryFormValues;
};

export default function SubCategoryForm({
  subCategoryId,
  categories,
  initialData,
}: SubCategoryFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SubCategoryFormValues>({
    defaultValues: initialData ?? { name: "", categoryId: "" },
  });

  const onSubmit = async (values: SubCategoryFormValues) => {
    const parsed = formSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!field) return;
        setError(field as keyof SubCategoryFormValues, {
          type: "manual",
          message: issue.message,
        });
      });
      return;
    }

    const response = await fetch(
      subCategoryId ? `/api/subcategories/${subCategoryId}` : "/api/subcategories",
      {
        method: subCategoryId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      }
    );

    if (!response.ok) {
      setError("name", {
        type: "manual",
        message: "Failed to save sub category. Please try again.",
      });
      return;
    }

    router.push("/admin/subcategories");
    router.refresh();
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Sub Category Name
          </label>
          <Input
            {...register("name")}
            placeholder="Sneakers"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
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
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || categories.length === 0}>
          {isSubmitting
            ? "Saving..."
            : subCategoryId
            ? "Update Sub Category"
            : "Create Sub Category"}
        </Button>
      </div>
    </form>
  );
}
