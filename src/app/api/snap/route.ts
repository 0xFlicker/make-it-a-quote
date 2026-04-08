import { NextRequest } from "next/server";
import { baseUrl } from "@/config";
import { fetchCast } from "@/neynar/cast";
import { snapInputPage, snapQuotePage, snapErrorPage } from "@/utils/snap";

// Extract inputs from the POST body.
// Farcaster sends: { header: "base64url", payload: "base64url", signature: "base64url" }
// Direct curl/dev: { inputs: {...} } or { fid, inputs, button_index, timestamp }
function extractInputsFromText(
  text: string,
): Record<string, unknown> {
  try {
    const json = JSON.parse(text);
    if (typeof json !== "object" || json === null) return {};

    // Direct JSON: { inputs: {...} }
    if (json.inputs) return json.inputs;

    // JFS as JSON object: { header, payload, signature }
    if (json.payload && typeof json.payload === "string") {
      const decoded = JSON.parse(
        Buffer.from(json.payload, "base64url").toString("utf-8"),
      );
      if (decoded.inputs) return decoded.inputs;
    }
  } catch {
    // ignore
  }

  return {};
}

// GET: show the input form snap
export async function GET() {
  return snapInputPage(baseUrl);
}

// POST: user submitted a cast URL/hash via the input field
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const inputs = extractInputsFromText(rawBody);
    const castInput = typeof inputs.cast === "string" ? inputs.cast : "";

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
        if (
          url.hostname === "warpcast.com" ||
          url.hostname === "farcaster.com" ||
          url.hostname === "farcaster.xyz"
        ) {
          // Neynar API only accepts warpcast.com URLs
          url.hostname = "warpcast.com";
          identifier = url.toString();
        } else {
          identifier = url.pathname.split("/").pop()!;
          type = "hash";
        }
      } catch {
        return snapErrorPage(
          "Invalid input. Paste a cast URL or hash starting with 0x.",
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
