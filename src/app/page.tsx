import { baseUrl } from "@/config";
import { fetchMetadata } from "frames.js/next";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Make it a quote",
    openGraph: {
      images: [
        {
          url: new URL(
            "/quote/0xa9c00b85171e2b9db7ccaf627fc12375e33eae6c",
            baseUrl,
          ).toString(),
        },
      ],
    },
    other: await fetchMetadata(new URL("/frames", baseUrl)),
  };
}

export default function Page() {
  return <span>make it a quote</span>;
}
