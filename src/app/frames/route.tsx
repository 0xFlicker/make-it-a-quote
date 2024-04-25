/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
import { fetchCast } from "@/neynar/cast";

const handleRequest = frames(async (ctx) => {
  const messageHash = ctx.message?.castId?.hash;

  if (!messageHash) {
    return {
      image: (
        <span>
          To use make it a quote, drop the link in the reply to a cast
        </span>
      ),
      buttons: [
        <Button
          action="link"
          target={`${
            process.env.VERCEL_URL
              ? `https://{process.env.VERCEL_URL}`
              : "http://localhost:3000"
          }`}
        >
          get link
        </Button>,
        <Button action="link" target="https://warpcast.com/flick">
          created by flick
        </Button>,
      ],
    };
  }
  const { cast } = await fetchCast({
    identifier: messageHash,
    type: "hash",
  });
  const parentHash = cast?.parent_hash;
  const ogImage = `${
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  }/quote/${parentHash}`;
  return {
    image: ogImage,
    buttons: [
      <Button action="link" target={ogImage}>
        share
      </Button>,
      <Button action="link" target="https://warpcast.com/flick">
        created by flick
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
