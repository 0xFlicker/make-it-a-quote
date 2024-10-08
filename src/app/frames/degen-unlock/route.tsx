import { airstackMiddleware, frames } from "../frames";
import { isAddress } from "viem";

import { processDegenUnlock } from "../helper";

const handleRequest = frames(
  async (ctx) => {
    const senderAddresses = [
      ...(ctx.message?.requesterVerifiedAddresses ?? []),
      ...(ctx.message?.connectedAddress ? [ctx.message?.connectedAddress] : []),
    ].filter((v) => isAddress(v)) as `0x${string}`[];

    return await processDegenUnlock(senderAddresses);
  },
  {
    middleware: [airstackMiddleware],
  },
);

export const GET = handleRequest;
export const POST = handleRequest;
