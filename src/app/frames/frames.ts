import { createFrames, types } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";
import { airstackApiKey } from "@/config";
import "@/graphql/airstack";
import { type ValidateFramesMessageInput } from "@airstack/frames";
import { hexStringToUint8Array } from "frames.js";

// initFrame(airstackApiKey);

export const airstackMiddleware: types.FramesMiddleware<
  any,
  { airstack?: { valid: boolean } }
> = async (ctx, next) => {
  if (ctx.request.method !== "POST") {
    return next();
  }
  try {
    const body: ValidateFramesMessageInput = await ctx.request.clone().json();
    const validateMessageResponse = await fetch(
      "https://hubs.airstack.xyz/v1/validateMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-airstack-hubs": airstackApiKey,
        },
        body: hexStringToUint8Array(body.trustedData.messageBytes),
      },
    );
    if (!validateMessageResponse.ok) {
      console.log("Failed", await validateMessageResponse.text());
    }
    return next({
      airstack: {
        valid: validateMessageResponse.ok,
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

// export const airstackMiddleware: types.FramesMiddleware<
//   any,
//   { airstack: { valid: boolean } }
// > = async (ctx, next) => {
//   try {
//     const body: ValidateFramesMessageInput = await ctx.request.clone().json();
//     const res: ValidateFramesMessageOutput = await validateFramesMessage(body);
//     console.log("Message is valid", res.isValid);
//     return next({
//       airstack: {
//         valid: res.isValid,
//       },
//     });
//   } catch (error) {
//     console.error("Unable to verify message", error);
//     return next({
//       airstack: {
//         valid: false,
//       },
//     });
//   }
// };

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
