"use client";

import React, { FC, useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";

import { baseUrl } from "@/config";
import { Skeleton } from "../action/skeleton";

export const Client: FC<{ castId: string }> = ({ castId }) => {
  useEffect(() => {
    sdk.actions
      .ready()
      .then(async () => {
        sdk.actions.composeCast({
          parent: {
            type: "cast",
            hash: castId,
          },
          text: "make it a quote",
          embeds: [
            new URL(`${baseUrl}/quote/${castId}/img`, baseUrl).toString(),
          ],
        });
      })
      .catch((error) => {
        console.error("frame error", error);
      });
  });
  return <Skeleton />;
};
