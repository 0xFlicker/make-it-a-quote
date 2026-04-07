import { baseUrl } from "@/config";
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
  };
}

export default function Page({
  params: { castHash },
}: {
  params: { castHash: `0x${string}` };
}) {
  const ogUrl = new URL(`${baseUrl}/quote/${castHash}/img`, baseUrl).toString();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={ogUrl} style={{ width: "100%", height: "auto" }} />
    </div>
  );
}
