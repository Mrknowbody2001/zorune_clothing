"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stripRichText } from "@/lib/rich-text";
import type { ProductDTO } from "@/types";

type ProductTableProps = {
  products: ProductDTO[];
};

export default function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "LKR",
      }),
    []
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (!response.ok) {
      alert("Failed to delete product. Please try again.");
      return;
    }

    router.refresh();
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-sm text-zinc-500">
        No products yet. Create your first product to get started.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const descriptionPreview = stripRichText(product.description);

            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900">
                      {product.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {descriptionPreview.slice(0, 64)}
                      {descriptionPreview.length > 64 ? "..." : ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900">
                      {product.categoryName}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {product.subCategoryName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatter.format(product.price)}</TableCell>
                <TableCell>
                  {new Date(product.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/${product.id}`}>View</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product.id)}
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
