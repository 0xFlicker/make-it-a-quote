import { NextRequest } from "next/server";
import { baseUrl } from "@/config";
import { fetchCast } from "@/neynar/cast";
import { snapInputPage, snapQuotePage, snapErrorPage } from "@/utils/snap";

// Decode JFS compact string → payload object
// JFS format: BASE64URL(header) . BASE64URL(payload) . BASE64URL(signature)
function decodeJfsPayload(jfs: string): Record<string, unknown> | null {
  try {
    const parts = jfs.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// Extract inputs from either raw JSON body or JFS-signed body
function extractInputsFromText(
  text: string,
): Record<string, unknown> {
  // Try raw JSON first (e.g. local dev / curl / Farcaster proxy)
  try {
    const json = JSON.parse(text);
    if (typeof json === "object" && json !== null) {
      // Direct: { inputs: {...} }
      if (json.inputs) return json.inputs;
      // Farcaster proxy wraps: { payload: { inputs: {...} } }
      if (json.payload?.inputs) return json.payload.inputs;
    }
  } catch {
    // not JSON
  }

  // Try JFS (signed payload from Farcaster clients)
  // Body could be the raw JFS string or a JSON-encoded JFS string
  const jfsString = text.startsWith('"') ? JSON.parse(text) : text;
  const payload = decodeJfsPayload(jfsString);
  if (payload?.inputs && typeof payload.inputs === "object") {
    return payload.inputs as Record<string, unknown>;
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
    console.log("SNAP POST raw body:", rawBody);
    console.log("SNAP POST content-type:", req.headers.get("content-type"));

    // Re-create request for extractInputs since we consumed the body
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
