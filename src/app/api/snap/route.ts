import { NextRequest } from "next/server";
import { baseUrl } from "@/config";
import { fetchCast } from "@/neynar/cast";
import { snapInputPage, snapQuotePage, snapErrorPage } from "@/utils/snap";

// GET: show the input form snap
export async function GET() {
  return snapInputPage(baseUrl);
}

// POST: user submitted a cast URL/hash via the input field
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const castInput: string | undefined = body?.inputs?.cast;

    if (!castInput || castInput.trim().length === 0) {
      return snapErrorPage("Please enter a cast URL or hash.", baseUrl);
    }

    const trimmed = castInput.trim();

    let identifier: string;
    let type: "hash" | "url" = "url";

    if (trimmed.startsWith("0x")) {
      identifier = trimmed;
      type = "hash";
    } else {
      try {
        const url = new URL(trimmed);
        if (url.hostname !== "warpcast.com") {
          // Try to extract hash from non-warpcast URL
          identifier = url.pathname.split("/").pop()!;
          type = "hash";
        } else {
          identifier = trimmed;
        }
      } catch {
        return snapErrorPage(
          "Invalid input. Paste a Warpcast URL or a cast hash starting with 0x.",
          baseUrl,
        );
      }
    }

    const { cast } = await fetchCast({ identifier, type });

    if (!cast) {
      return snapErrorPage("Cast not found.", baseUrl);
    }

    const text = cast.text || "";
    const username = cast.author?.username || "unknown";
    const hash = cast.hash;

    return snapQuotePage({ castHash: hash, text, username, baseUrl });
  } catch (error) {
    console.error("snap POST error", error);
    return snapErrorPage("Failed to generate quote. Try again.", baseUrl);
  }
}
