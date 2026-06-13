import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/admin-actions";
import { DeleteForm } from "@/components/admin/delete-form";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      collection: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-wood-dark">
            Products & Stock
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your furniture catalog, inventory, prices, and visibility.
          </p>
        </div>
        <Button className="bg-wood-dark text-background-primary hover:bg-wood-medium sm:w-auto" render={<Link href="/admin/products/new" />}>
          Add Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-text-primary">
          <thead className="bg-background-secondary font-medium uppercase tracking-wider text-[10px] text-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4">Product</th>
              <th scope="col" className="px-6 py-4">Collection</th>
              <th scope="col" className="px-6 py-4">Price</th>
              <th scope="col" className="px-6 py-4">Stock</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border border-t border-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">
                  No products found. Click &quot;Add Product&quot; to create your first catalog item.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const firstImage = product.images[0]?.url;
                return (
                  <tr key={product.id} className="hover:bg-background-primary/30 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      {firstImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstImage} alt={product.name} className="h-10 w-10 object-cover rounded-sm bg-background-secondary" />
                      ) : (
                        <div className="h-10 w-10 bg-background-secondary rounded-sm border border-border flex items-center justify-center text-[10px] text-text-secondary">No img</div>
                      )}
                      <div>
                        <div className="font-semibold text-text-primary text-sm">{product.name}</div>
                        <div className="text-xs text-text-secondary truncate max-w-xs">{product.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-medium">
                      {product.collection?.name || <span className="italic">None</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-sm px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
                        product.stock === 0 ? "bg-red-50 text-red-700 border-red-200/50" :
                        product.stock <= 5 ? "bg-amber-50 text-amber-700 border-amber-200/50" :
                        "bg-stone-100/50 text-stone-700 border-stone-200/60"
                      }`}>
                        {product.stock} {product.stock === 1 ? "unit" : "units"}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-1.5">
                      {product.published ? (
                        <span className="inline-block rounded-sm bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                          Published
                        </span>
                      ) : (
                        <span className="inline-block rounded-sm bg-stone-50 text-stone-400 border border-stone-200/40 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                          Draft
                        </span>
                      )}
                      {product.featured && (
                        <span className="inline-block rounded-sm bg-wood-medium/10 text-wood-medium border border-wood-medium/20 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs font-medium text-wood-medium hover:text-wood-dark hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteForm
                        id={product.id}
                        action={deleteProduct}
                        confirmMessage={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
