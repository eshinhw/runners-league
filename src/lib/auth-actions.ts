"use server";

import { signIn, signOut } from "@/lib/auth";

export async function googleSignIn() {
  await signIn("google", { redirectTo: "/" });
}

export async function emailSignIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) throw new Error("Please enter your email.");
  await signIn("email", { email, redirectTo: "/" });
}

export async function userSignOut() {
  await signOut();
}
