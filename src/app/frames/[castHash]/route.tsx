/* eslint-disable react/jsx-key */

import { Button } from "frames.js/next";
import { airstackMiddleware, frames } from "../../frames/frames";
import { baseUrl } from "@/config";
import {
  validateFramesMessage,
  ValidateFramesMessageInput,
  ValidateFramesMessageOutput,
} from "@airstack/frames";

import { NextRequest } from "next/server";

const handleRequest = (castHash: `0x${string}`) => {
  return frames(
    () => {
      const ogImage = `${baseUrl}/quote/${castHash}/img`;
      return {
        image: ogImage,
        buttons: [
          <Button action="link" target={`${baseUrl}/quote/${castHash}`}>
            share
          </Button>,
          <Button action="post" target={`${baseUrl}/frames/${castHash}`}>
            refresh
          </Button>,
          <Button action="link" target="https://warpcast.com/flick/0x1f50f7b1">
            created by flick
          </Button>,
          <Button
            action="link"
            target={`https://warpcast.com/~/add-cast-action?url=${`${baseUrl}/action`}`}
          >
            action
          </Button>,
        ],
      };
    },
    {
      middleware: [airstackMiddleware],
    },
  );
};

export const GET = (
  req: NextRequest,
  { params: { castHash } }: { params: { castHash: `0x${string}` } },
) => {
  return handleRequest(castHash)(req);
};
export const POST = async (
  req: NextRequest,
  { params: { castHash } }: { params: { castHash: `0x${string}` } },
) => {
  // try {
  //   const body: ValidateFramesMessageInput = await req.clone().json();
  //   const res: ValidateFramesMessageOutput = await validateFramesMessage(body);
  //   console.log("Message is valid", res.isValid);
  // } catch (error) {
  //   console.error("Unable to verify message", error);
  // }

  return handleRequest(castHash)(req);
};
