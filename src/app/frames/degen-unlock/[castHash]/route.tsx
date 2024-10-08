import { NextRequest } from "next/server";
import { fetchCast } from "@/utils/fetchCast";
import { airstackMiddleware, frames } from "../../frames";
import { processDegenUnlock } from "../../helper";

import { isAddress } from "viem";
import { fetchUserInfoByFID } from "@/neynar/user";

export const POST = async (
  req: NextRequest,
  { params }: { params: { castHash: string } },
) => {
  const { castHash } = params;
  const { cast } = await fetchCast(castHash);
  const fid = cast.author.fid;
  // fetch user's verified addresses
  const result = await fetchUserInfoByFID([fid]);

  const user = result.users[0];
  const verifiedAddresses = user.verified_addresses.eth_addresses.concat(
    user.custody_address as `0x${string}`,
  );
  return frames(
    async (ctx) => {
      return await processDegenUnlock(verifiedAddresses);
    },
    {
      middleware: [airstackMiddleware],
    },
  )(req);
};

export const GET = async (
  req: NextRequest,
  { params }: { params: { castHash: string } },
) => {
  const { castHash } = params;
  const { cast } = await fetchCast(castHash);
  const fid = cast.author.fid;
  // fetch user's verified addresses
  const result = await fetchUserInfoByFID([fid]);

  const user = result.users[0];
  const verifiedAddresses = user.verified_addresses.eth_addresses.concat(
    user.custody_address as `0x${string}`,
  );
  return frames(
    async (ctx) => {
      return await processDegenUnlock(verifiedAddresses);
    },
    {
      middleware: [airstackMiddleware],
    },
  )(req);
};
