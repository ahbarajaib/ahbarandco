import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  // Fetch collections to select from in the form
  const collections = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">Add New Product</h1>
        <p className="text-sm text-text-secondary mt-1">Create a new item in your catalog.</p>
      </div>

      <ProductForm
        collections={collections}
        submitAction={createProduct}
        title="Product Information"
      />
    </div>
  );
}
