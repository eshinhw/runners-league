"use server";

import { signIn, signOut } from "@/lib/auth";

export async function googleSignIn() {
  await signIn("google");
}

export async function emailSignIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) throw new Error("이메일을 입력해주세요.");
  await signIn("email", { email, redirectTo: "/" });
}

export async function userSignOut() {
  await signOut();
}
