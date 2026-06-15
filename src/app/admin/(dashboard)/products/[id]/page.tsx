import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/lib/admin-actions";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  // 1. Fetch product data
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        orderBy: { createdAt: "asc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            select: { url: true },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Fetch collections list
  const collections = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  // Pre-bind the product ID to the update action
  const updateActionWithId = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">Edit Product</h1>
        <p className="text-sm text-text-secondary mt-1">Modify details for &quot;{product.name}&quot;.</p>
      </div>

      <ProductForm
        initialData={product}
        collections={collections}
        submitAction={updateActionWithId}
        title="Modify Product details"
      />
    </div>
  );
}
