"use client";
import React, { FC, useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { CastAction } from "@/features/editor/components/CastAction";
import { Skeleton } from "./skeleton";
import { baseUrl } from "@/config";
export const Client: FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    sdk.actions
      .ready()
      .then(async () => {
        console.log("frame ready");
        const { location } = await sdk.context;
        switch (location?.type) {
          case "cast_embed": {
            const { hash } = location.cast;
            const url = new URL(
              `${baseUrl}/quote/${hash}/img`,
              baseUrl,
            ).toString();
            setImageUrl(url);
            break;
          }
        }
      })
      .catch((error) => {
        console.error("frame error", error);
      });
  }, []);
  return imageUrl ? (
    <CastAction aspectRatio={11 / 9} imageUrl={imageUrl} />
  ) : (
    <Skeleton />
  );
};
