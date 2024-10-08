import { baseUrl } from "@/config";
import { ActionMetadata } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { frames } from "../../frames/frames";

export const GET = async (req: NextRequest) => {
  const actionMetadata: ActionMetadata = {
    action: {
      type: "post",
    },
    icon: "eye-closed",
    name: "$DEGEN unlock date",
    aboutUrl: `${baseUrl}`,
    description: "Returns the unlock date of the user's $DEGEN",
  };

  return NextResponse.json(actionMetadata);
};

export const POST = frames(async (ctx) => {
  const castId = ctx.message?.castId?.hash;
  return NextResponse.json({
    type: "frame",
    frameUrl: castId
      ? `${baseUrl}/frames/degen-unlock/${castId}`
      : `${baseUrl}/frames/degen-unlock`,
  });
});
