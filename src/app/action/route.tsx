import { baseUrl } from "@/config";
import { ActionMetadata } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { frames } from "../frames/frames";

export const GET = async (req: NextRequest) => {
  const actionMetadata: ActionMetadata = {
    action: {
      type: "post",
    },
    icon: "device-camera",
    name: "Make it a quote",
    aboutUrl: `${baseUrl}`,
    description: "Generate a quote image for a cast.",
  };

  return NextResponse.json(actionMetadata);
};

export const POST = frames(async (ctx) => {
  const castId = ctx.message?.castId?.hash;
  return NextResponse.json({
    type: "frame",
    frameUrl: castId ? `${baseUrl}/quote/${castId}` : `${baseUrl}`,
  });
});
