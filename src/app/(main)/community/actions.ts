"use server";

import { revalidatePath } from "next/cache";
import type { PostType } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");
  return session.user.id;
}

const VALID_TYPES: PostType[] = ["DISCUSSION", "ARTICLE", "QUESTION"];

export async function createPost(formData: FormData) {
  const userId = await requireUserId();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "DISCUSSION") as PostType;
  const type = VALID_TYPES.includes(typeRaw) ? typeRaw : "DISCUSSION";
  const tagsRaw = String(formData.get("tags") ?? "");

  if (!title) throw new Error("Please enter a title.");
  if (!body) throw new Error("Please enter a body.");

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);

  await prisma.post.create({
    data: { authorId: userId, title, body, type, tags },
  });

  revalidatePath("/community");
}

export async function addComment(postId: string, formData: FormData) {
  const userId = await requireUserId();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Please enter a comment.");

  await prisma.comment.create({
    data: { authorId: userId, postId, body },
  });

  revalidatePath(`/community/${postId}`);
}

export async function toggleLike(postId: string) {
  const userId = await requireUserId();

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
}
