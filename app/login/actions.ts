"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "pantry_session";

export async function login(formData: FormData) {
  const passcode = formData.get("passcode");

  if (typeof passcode !== "string" || passcode !== process.env.PANTRY_PASSCODE) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, passcode, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/");
}
