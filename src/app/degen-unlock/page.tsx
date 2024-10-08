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
            "/quote/0xa9c00b85171e2b9db7ccaf627fc12375e33eae6c/img",
            baseUrl,
          ).toString(),
        },
      ],
    },
    other: await fetchMetadata(new URL("/frames/degen-unlock", baseUrl)),
  };
}

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        marginTop: "32px",
      }}
    >
      <p>to use make it a quote frame:</p>
      <p>drop quote.flick.ing in the reply to a cast</p>
      <p>then click &quot;make it a quote&quot;</p>
      <p>
        <a
          href="https://warpcast.com/~/add-cast-action?url=https://quote.flick.ing/action"
          style={{
            color: "#D6B8FF",
          }}
        >
          install as an action
        </a>
      </p>
      <p>
        created by:{" "}
        <a
          href="https://warpscast.com/flick"
          style={{
            color: "#D6B8FF",
          }}
        >
          flick
        </a>
      </p>
    </div>
  );
}
