import { neynarApiKey } from "@/config";
import { CastResult } from "./types";

export async function fetchCast({
  identifier,
  type,
}: {
  identifier: string;
  type: "hash" | "url";
}): Promise<CastResult> {
  const params = new URLSearchParams();
  params.append("identifier", identifier);
  params.append("type", type);

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/cast?${params.toString()}`,
    {
      headers: {
        api_key: neynarApiKey,
      },
    },
  );
  return response.json();
}
