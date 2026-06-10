import { JournalForm } from "@/components/admin/journal-form";
import { createJournalPost } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminNewJournalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">Write Article</h1>
        <p className="text-sm text-text-secondary mt-1">Compose a new story for the journal.</p>
      </div>

      <JournalForm
        submitAction={createJournalPost}
        title="Article Composer"
      />
    </div>
  );
}
