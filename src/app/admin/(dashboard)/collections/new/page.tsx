import { CollectionForm } from "@/components/admin/collection-form";
import { createCollection } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminNewCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">Add New Collection</h1>
        <p className="text-sm text-text-secondary mt-1">Create a new categories group.</p>
      </div>

      <CollectionForm
        submitAction={createCollection}
        title="Collection Details"
      />
    </div>
  );
}
