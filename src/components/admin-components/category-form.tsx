"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryCreateSchema } from "@/validations/category.schema";

const formSchema = categoryCreateSchema;

type CategoryFormValues = z.infer<typeof formSchema>;

type CategoryFormProps = {
  categoryId?: string;
  initialData?: CategoryFormValues;
};

export default function CategoryForm({
  categoryId,
  initialData,
}: CategoryFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    defaultValues: initialData ?? { name: "" },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const parsed = formSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!field) return;
        setError(field as keyof CategoryFormValues, {
          type: "manual",
          message: issue.message,
        });
      });
      return;
    }

    const response = await fetch(
      categoryId ? `/api/categories/${categoryId}` : "/api/categories",
      {
        method: categoryId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      }
    );

    if (!response.ok) {
      setError("name", {
        type: "manual",
        message: "Failed to save category. Please try again.",
      });
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Category Name</label>
        <Input
          {...register("name")}
          placeholder="Fashion"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : categoryId
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
