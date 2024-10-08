import { neynarApiKey, viewerFid } from "@/config";
import { HttpResult, Result, UserInfo, UserResult } from "./types";

export async function fetchUserInfoByName(
  username: string,
): Promise<HttpResult<UserResult>> {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("viewerFid", viewerFid.toString());

  const response = await fetch(
    `https://api.neynar.com/v1/farcaster/user-by-username?${params.toString()}`,
    {
      headers: {
        api_key: neynarApiKey,
      },
    },
  );
  return response.json();
}

export async function fetchUserInfoByFID(
  fids: number[],
): Promise<Result<"users", UserInfo[]>> {
  const params = new URLSearchParams();
  params.append("fids", fids.join(","));
  params.append("viewerFid", viewerFid.toString());

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?${params.toString()}`,
    {
      headers: {
        api_key: neynarApiKey,
      },
    },
  );
  return response.json();
}
