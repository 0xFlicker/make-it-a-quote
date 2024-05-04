import { baseUrl } from "@/config";
import { fetchMetadata } from "frames.js/next";
import { Metadata } from "next";

export async function generateMetadata({
  params: { castHash },
}: {
  params: { castHash: `0x${string}` };
}): Promise<Metadata> {
  return {
    title: "Make it a quote",
    openGraph: {
      images: [
        {
          url: new URL(`${baseUrl}/quote/${castHash}/img`, baseUrl).toString(),
        },
      ],
    },
    other: await fetchMetadata(new URL(`/frames/${castHash}`, baseUrl)),
  };
}

export default function Page({
  params: { castHash },
}: {
  params: { castHash: `0x${string}` };
}) {
  // return a fullscreen image filling the width of the window
  const ogUrl = new URL(`${baseUrl}/quote/${castHash}/img`, baseUrl).toString();
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img
        src={ogUrl}
        style={{ width: "100vw", height: "100vh" }}
        content="cover"
      />
    </>
  );
}
