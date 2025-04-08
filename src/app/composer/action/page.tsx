import React from "react";
import { DefaultProvider } from "./default";
import { Metadata } from "next";
import { Client } from "./client";

export async function generateMetadata({}: {}): Promise<Metadata> {
  return {
    title: "Make it a quote",
    openGraph: {
      images: [
        // {
        //   url: new URL(`${baseUrl}/quote/${castHash}/img`, baseUrl).toString(),
        // },
      ],
    },
    // other: {
    //   ['fc:frame']
    // }
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
