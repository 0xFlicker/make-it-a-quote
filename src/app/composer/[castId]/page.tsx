import React from "react";
import { DefaultProvider } from "./default";
import { Metadata } from "next";
import { Client } from "./client";
import { baseUrl } from "@/config";

export async function generateMetadata({
  params,
}: {
  params: { castId: string };
}): Promise<Metadata> {
  const frame = {
    version: "next",
    imageUrl: "https://quote.flick.ing/flick-full.png",
    button: {
      title: "Make it a quote",
      action: {
        type: "launch_frame",
        url: `${baseUrl}/composer/${params.castId}`,
        name: "Make it a quote",
        splashImageUrl: "https://quote.flick.ing/flick.png",
        splashBackgroundColor: "#3D1A66",
      },
    },
  };

  return {
    title: "Make it a quote",
    openGraph: {
      images: [
        // {
        //   url: new URL(`${baseUrl}/quote/${castHash}/img`, baseUrl).toString(),
        // },
      ],
    },
    other: {
      ["fc:frame"]: JSON.stringify(frame),
    },
    // other: await fetchMetadata(new URL(`/frames/${castHash}`, baseUrl)),
  };
}

const MainPage = async () => {
  return (
    <>
      <DefaultProvider>
        <Client />
      </DefaultProvider>
    </>
  );
};

export default MainPage;
