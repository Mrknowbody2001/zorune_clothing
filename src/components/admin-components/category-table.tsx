"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategoryDTO } from "@/types";

type CategoryTableProps = {
  categories: CategoryDTO[];
};

export default function CategoryTable({ categories }: CategoryTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (!response.ok) {
      alert("Failed to delete category. Please try again.");
      return;
    }

    router.refresh();
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-sm text-zinc-500">
        No categories yet. Create your first category to get started.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Sub Categories</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="max-w-[180px] truncate text-xs text-zinc-500">
                {category.id}
              </TableCell>
              <TableCell className="font-medium text-zinc-900">
                {category.name}
              </TableCell>
              <TableCell>{category.subcategoryCount ?? 0}</TableCell>
              <TableCell>
                {new Date(category.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/categories/${category.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/categories/edit/${category.id}`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === category.id}
                    onClick={() => handleDelete(category.id)}
                  >
                    {deletingId === category.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
