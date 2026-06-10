import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CollectionForm } from "@/components/admin/collection-form";
import { updateCollection } from "@/lib/admin-actions";

type EditCollectionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminEditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params;

  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    notFound();
  }

  const updateActionWithId = updateCollection.bind(null, collection.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">Edit Collection</h1>
        <p className="text-sm text-text-secondary mt-1">Modify details for &quot;{collection.name}&quot;.</p>
      </div>

      <CollectionForm
        initialData={collection}
        submitAction={updateActionWithId}
        title="Modify Collection details"
      />
    </div>
  );
}
