import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { deleteCollection } from "@/lib/admin-actions";
import { DeleteForm } from "@/components/admin/delete-form";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-wood-dark">
            Collections
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Group products into shop categories and set their custom layouts/sorting.
          </p>
        </div>
        <Button className="bg-wood-dark text-background-primary hover:bg-wood-medium sm:w-auto" render={<Link href="/admin/collections/new" />}>
          Add Collection
        </Button>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-text-primary">
          <thead className="bg-background-secondary font-medium uppercase tracking-wider text-[10px] text-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4">Collection</th>
              <th scope="col" className="px-6 py-4">Slug</th>
              <th scope="col" className="px-6 py-4">Sort Order</th>
              <th scope="col" className="px-6 py-4">Products</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border border-t border-border">
            {collections.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">
                  No collections found. Click &quot;Add Collection&quot; to create your first furniture group.
                </td>
              </tr>
            ) : (
              collections.map((col) => (
                <tr key={col.id} className="hover:bg-background-primary/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    {col.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={col.imageUrl} alt={col.name} className="h-10 w-10 object-cover rounded-sm bg-background-secondary" />
                    ) : (
                      <div className="h-10 w-10 bg-background-secondary rounded-sm border border-border flex items-center justify-center text-[10px] text-text-secondary">No img</div>
                    )}
                    <div>
                      <div className="font-semibold text-text-primary text-sm">{col.name}</div>
                      <div className="text-xs text-text-secondary max-w-xs truncate">{col.description || "No description"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary font-medium">
                    /{col.slug}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {col.sortOrder}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {col._count.products} items
                  </td>
                  <td className="px-6 py-4">
                    {col.published ? (
                      <span className="inline-block rounded-sm bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block rounded-sm bg-stone-50 text-stone-400 border border-stone-200/40 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/collections/${col.id}`}
                      className="text-xs font-medium text-wood-medium hover:text-wood-dark hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteForm
                      id={col.id}
                      action={deleteCollection}
                      confirmMessage={`Are you sure you want to delete collection "${col.name}"? Referenced products will have their collection unassigned.`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
