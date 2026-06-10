import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalForm } from "@/components/admin/journal-form";
import { updateJournalPost } from "@/lib/admin-actions";

type EditJournalPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminEditJournalPage({ params }: EditJournalPageProps) {
  const { id } = await params;

  const post = await prisma.journalPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  const updateActionWithId = updateJournalPost.bind(null, post.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">Edit Article</h1>
        <p className="text-sm text-text-secondary mt-1">Modify copy and image for &quot;{post.title}&quot;.</p>
      </div>

      <JournalForm
        initialData={post}
        submitAction={updateActionWithId}
        title="Modify Article"
      />
    </div>
  );
}
