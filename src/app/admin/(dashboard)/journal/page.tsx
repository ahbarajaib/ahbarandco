import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { deleteJournalPost } from "@/lib/admin-actions";
import { DeleteForm } from "@/components/admin/delete-form";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const posts = await prisma.journalPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-wood-dark">
            Journal CMS
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Write and publish editorial pieces, design journals, or workshop news.
          </p>
        </div>
        <Button className="bg-wood-dark text-background-primary hover:bg-wood-medium sm:w-auto" render={<Link href="/admin/journal/new" />}>
          New Article
        </Button>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-text-primary">
          <thead className="bg-background-secondary font-medium uppercase tracking-wider text-[10px] text-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4">Article Title</th>
              <th scope="col" className="px-6 py-4">Slug</th>
              <th scope="col" className="px-6 py-4">Publish Date</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border border-t border-border">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-text-secondary">
                  No articles found. Click &quot;New Article&quot; to write your first story.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-background-primary/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    {post.coverImageUrl ? (
                      <img src={post.coverImageUrl} alt={post.title} className="h-10 w-10 object-cover rounded-sm bg-background-secondary" />
                    ) : (
                      <div className="h-10 w-10 bg-background-secondary rounded-sm border border-border flex items-center justify-center text-[10px] text-text-secondary">No img</div>
                    )}
                    <div>
                      <div className="font-semibold text-text-primary text-sm">{post.title}</div>
                      <div className="text-xs text-text-secondary max-w-xs truncate">{post.excerpt || "No excerpt provided"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary font-medium">
                    /{post.slug}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {post.publishedAt ? (
                      new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    ) : (
                      <span className="italic">Not published</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/journal/${post.id}`}
                      className="text-xs font-medium text-wood-medium hover:text-wood-dark hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteForm
                      id={post.id}
                      action={deleteJournalPost}
                      confirmMessage={`Are you sure you want to delete article "${post.title}"?`}
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
