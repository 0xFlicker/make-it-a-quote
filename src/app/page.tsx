import { fetchMetadata } from "frames.js/next";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
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
    other: await fetchMetadata(
      new URL("/frames", "https://make-it-a-quote.vercel.app"),
    ),
  };
}

export default function Page() {
  return <span>make it a quote</span>;
}
