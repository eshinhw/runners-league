import Link from "next/link";
import type { PostType } from "@/generated/prisma/client";
import { LikeButton } from "@/components/community/LikeButton";
import { auth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { createPost } from "./actions";

export const dynamic = "force-dynamic";

type Tab = "new" | "top";

const TABS: { key: Tab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "top", label: "Top" },
];

const TYPE_LABEL: Record<PostType, string> = {
  DISCUSSION: "💬 Discussion",
  ARTICLE: "📰 Info",
  QUESTION: "❓ Q&A",
  TRAINING_PLAN: "🏃 Training Plan",
};

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === "top" ? "top" : "new";
  const session = await auth();

  const posts = await prisma.post.findMany({
    orderBy: tab === "top" ? { likes: { _count: "desc" } } : { createdAt: "desc" },
    include: {
      author: { select: { username: true, displayId: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
      _count: { select: { likes: true, comments: true } },
    },
    take: 50,
  });

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Community</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Discussions, info sharing, and Q&amp;A between runners.
        </p>
      </div>

      {session?.user?.id ? (
        <form
          action={createPost}
          className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <input name="title" placeholder="Title" required maxLength={140} className={inputCls} />
          <textarea name="body" placeholder="What's on your mind?" required rows={3} className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <select name="type" defaultValue="DISCUSSION" className={inputCls}>
              <option value="DISCUSSION">💬 Discussion</option>
              <option value="ARTICLE">📰 Info</option>
              <option value="QUESTION">❓ Q&amp;A</option>
            </select>
            <input name="tags" placeholder="Tags, comma separated (optional)" className={inputCls} />
          </div>
          <button type="submit" className="self-start rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white">
            Post
          </button>
        </form>
      ) : (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800">
          <Link href="/login" className="font-medium text-orange-500 underline">
            Sign in
          </Link>{" "}
          to start a discussion.
        </div>
      )}

      <nav className="flex gap-2 border-b border-zinc-200 pb-px dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/community?tab=${t.key}`}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-b-2 border-orange-500 text-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-3">
        {posts.length === 0 && <p className="text-sm text-zinc-500">No posts yet — be the first to start one.</p>}
        {posts.map((post) => (
          <article key={post.id} className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <LikeButton
              postId={post.id}
              liked={Array.isArray(post.likes) && post.likes.length > 0}
              count={post._count.likes}
              signedIn={!!session?.user?.id}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{TYPE_LABEL[post.type]}</span>
                <span>·</span>
                <span>{post.author.displayId}</span>
                <span>·</span>
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
              <Link href={`/community/${post.id}`} className="mt-1 block font-medium hover:underline">
                {post.title}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{post.body}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-900">
                    #{tag}
                  </span>
                ))}
                <Link href={`/community/${post.id}`} className="ml-auto text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  💬 {post._count.comments}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
