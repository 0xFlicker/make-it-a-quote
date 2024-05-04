/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../../frames/frames";
import { baseUrl } from "@/config";
import { NextRequest } from "next/server";

const handleRequest = (castHash: `0x${string}`) =>
  frames(async () => {
    const ogImage = `${baseUrl}/quote/${castHash}/img`;
    return {
      image: ogImage,
      buttons: [
        <Button action="link" target={`${baseUrl}/quote/${castHash}`}>
          share
        </Button>,
        <Button action="link" target="https://warpcast.com/flick">
          created by flick
        </Button>,
      ],
    };
  });

export const GET = (
  req: NextRequest,
  { params: { castHash } }: { params: { castHash: `0x${string}` } },
) => {
  return handleRequest(castHash)(req);
};
export const POST = (
  req: NextRequest,
  { params: { castHash } }: { params: { castHash: `0x${string}` } },
) => {
  return handleRequest(castHash)(req);
};
