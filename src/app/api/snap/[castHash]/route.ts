import { NextRequest } from "next/server";
import { baseUrl } from "@/config";
import { fetchCast } from "@/neynar/cast";
import { snapQuotePage, snapErrorPage } from "@/utils/snap";

// GET: render snap with the quote image for a specific cast
export async function GET(
  _req: NextRequest,
  { params }: { params: { castHash: string } },
) {
  try {
    const { castHash } = params;

    const { cast } = await fetchCast({
      identifier: castHash,
      type: "hash",
    });

    if (!cast) {
      return snapErrorPage("Cast not found.", baseUrl);
    }

    const text = cast.text || "";
    const username = cast.author?.username || "unknown";

    return snapQuotePage({ castHash: cast.hash, text, username, baseUrl });
  } catch (error) {
    console.error("snap GET error", error);
    return snapErrorPage("Failed to load quote.", baseUrl);
  }
}
