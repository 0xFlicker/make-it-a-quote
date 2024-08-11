import { NextRequest } from "next/server";
import { frames } from "../../frames";
import { composerAction, composerActionForm, error } from "frames.js/core";
import { baseUrl } from "@/config";

export const GET = async (req: NextRequest) => {
  return composerAction({
    action: {
      type: "post",
    },
    icon: "image",
    name: "flicking",
    aboutUrl: `${baseUrl}`,
    description: "flicking memes",
  });
};

export const POST = frames(async (ctx) => {
  const walletAddress = await ctx.walletAddress();
  // const castPfp = ctx.message?.requesterUserData?.profileImage;
  const castId = ctx.message?.castId?.hash;
  const createGameUrl = new URL(
    `/composer/action${castId ? `/${castId}` : ""}`,
    baseUrl,
  );

  // in case of composer actions we can't use ctx.state because the composer actions
  // if (!ctx.composerActionState) {
  //   return error("Must be called from composer");
  // }

  // createGameUrl.searchParams.set(
  //   "state",
  //   JSON.stringify(ctx.composerActionState),
  // );

  return composerActionForm({
    title: "flicking",
    url: createGameUrl.toString(),
  });
});
