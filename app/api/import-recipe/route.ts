import { NextResponse } from "next/server";
import { findRecipeJsonLd, mapJsonLdToRecipe } from "@/lib/parse-recipe-url";

const PRIVATE_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isPrivateHost(hostname: string): boolean {
  if (PRIVATE_HOSTNAMES.has(hostname)) return true;
  return (
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    /^169\.254\./.test(hostname)
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "Paste a recipe URL first." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Only http and https URLs are supported." }, { status: 400 });
  }
  if (isPrivateHost(parsedUrl.hostname)) {
    return NextResponse.json({ error: "That URL isn't reachable." }, { status: 400 });
  }

  let html: string;
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PantryApp/1.0)" },
      redirect: "follow",
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Couldn't fetch that page (status ${response.status}).` },
        { status: 502 },
      );
    }
    html = await response.text();
  } catch {
    return NextResponse.json({ error: "Couldn't reach that URL." }, { status: 502 });
  }

  const node = findRecipeJsonLd(html);
  if (!node) {
    return NextResponse.json(
      { error: "Couldn't find recipe data on that page — try pasting the recipe text instead." },
      { status: 422 },
    );
  }

  return NextResponse.json(mapJsonLdToRecipe(node));
}
