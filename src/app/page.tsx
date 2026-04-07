import { baseUrl } from "@/config";
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
      <p>to use make it a quote snap:</p>
      <p>drop quote.flick.ing in the reply to a cast</p>
      <p>then click &quot;make it a quote&quot;</p>
      <p>
        created by:{" "}
        <a
          href="https://farcaster.com/flick"
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
