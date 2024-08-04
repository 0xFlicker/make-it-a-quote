import { createFrames, types } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";
import { airstackApiKey } from "@/config";
import "@/graphql/airstack";
import {
  validateFramesMessage,
  ValidateFramesMessageInput,
  ValidateFramesMessageOutput,
} from "@airstack/frames";

export const airstackMiddleware: types.FramesMiddleware<
  any,
  { airstack: { valid: boolean } }
> = async (ctx, next) => {
  try {
    const body: ValidateFramesMessageInput = await ctx.request.clone().json();
    const res: ValidateFramesMessageOutput = await validateFramesMessage(body);
    console.log("Message is valid", res.isValid);
    return next({
      airstack: {
        valid: res.isValid,
      },
    });
  } catch (error) {
    console.error("Unable to verify message", error);
    return next({
      airstack: {
        valid: false,
      },
    });
  }
};

export const frames = createFrames({
  basePath: "/frames",
  middleware: [
    farcasterHubContext({
      ...(process.env.NODE_ENV === "production"
        ? {
            hubHttpUrl: "https://hubs.airstack.xyz",
            hubRequestOptions: {
              headers: {
                "x-airstack-hubs": airstackApiKey,
              },
            },
          }
        : {
            hubHttpUrl: "http://localhost:3010/hub",
          }),
    }),
  ],
});
