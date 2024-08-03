import { createFrames } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";
import { airstackApiKey } from "@/config";

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
