import Link from "next/link";
import { notFound } from "next/navigation";
import type { PostType } from "@/generated/prisma/client";
import { LikeButton } from "@/components/community/LikeButton";
import { SignInGate } from "@/components/SignInGate";
import { auth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { prisma } from "@/lib/prisma";
import { addComment } from "../actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<PostType, string> = {
  DISCUSSION: "💬 Discussion",
  ARTICLE: "📰 Info",
  QUESTION: "❓ Q&A",
  TRAINING_PLAN: "🏃 Training Plan",
};

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <SignInGate
        title="Community"
        description="Sign in to see discussions, info sharing, and Q&A between runners."
      />
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { username: true, displayId: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { likes: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { username: true, displayId: true } } },
      },
    },
  });

  if (!post) notFound();

  return (
    <main className="flex max-w-2xl flex-col gap-6">
      <Link href="/community" className="text-sm text-zinc-500 hover:underline">
        ← Back to Community
      </Link>

      <article className="flex items-start gap-3">
        <LikeButton postId={post.id} liked={post.likes.length > 0} count={post._count.likes} signedIn />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{TYPE_LABEL[post.type]}</span>
            <span>·</span>
            <Link href={`/profile/${post.author.username}`} className="hover:underline">
              {post.author.displayId}
            </Link>
            <span>·</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>
          <h1 className="mt-1 text-xl font-semibold">{post.title}</h1>
          <div
            className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert prose-a:text-orange-600 dark:prose-a:text-orange-400"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
          />
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-900">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">
          {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
        </h2>

        <form action={addComment.bind(null, post.id)} className="mb-4 flex flex-col gap-2">
          <textarea
            name="body"
            placeholder="Add a comment..."
            required
            rows={2}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="self-start rounded bg-orange-500 px-4 py-1.5 text-sm font-medium text-white">
            Comment
          </button>
        </form>

        <ul className="flex flex-col gap-4">
          {post.comments.map((c) => (
            <li key={c.id} className="text-sm">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Link href={`/profile/${c.author.username}`} className="font-medium text-zinc-600 hover:underline dark:text-zinc-300">
                  {c.author.displayId}
                </Link>
                <span>·</span>
                <span>{formatRelativeTime(c.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">{c.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
