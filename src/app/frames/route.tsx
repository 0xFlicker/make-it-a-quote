/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
import { fetchCast } from "@/neynar/cast";
import { baseUrl } from "@/config";

const handleRequest = frames(async (ctx) => {
  try {
    const messageHash = ctx.message?.castId?.hash;

    if (!messageHash) {
      return {
        image: (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                backgroundColor: "black",
                color: "white",
                padding: "64px",
                borderRadius: "32px",
                alignItems: "center",
              }}
            >
              <p>to use make it a quote frame:</p>
              <p>drop https://quote.flick.ing in the reply to a cast</p>
              <p>then click &quot;make it a quote&quot;</p>
              <p>
                by{" "}
                <span style={{ marginLeft: "8px", color: "#D6B8FF" }}>
                  @flick
                </span>
              </p>
            </div>
          </>
        ),
        buttons: [
          <Button action="post">make it a quote</Button>,
          <Button action="link" target={baseUrl}>
            get link
          </Button>,
          <Button action="link" target="https://warpcast.com/flick">
            created by flick
          </Button>,
        ],
      };
    }
    const { cast } = await fetchCast({
      identifier: messageHash,
      type: "hash",
    });
    const parentHash = cast?.parent_hash;
    const ogImage = `${baseUrl}/quote/${parentHash}`;
    return {
      image: ogImage,
      buttons: [
        <Button action="link" target={ogImage}>
          share
        </Button>,
        <Button action="link" target="https://warpcast.com/flick">
          created by flick
        </Button>,
      ],
    };
  } catch (error) {
    console.error(error);
    return {
      image: <span>error</span>,
      buttons: [
        <Button action="link" target={baseUrl}>
          get link
        </Button>,
        <Button action="link" target="https://warpcast.com/flick">
          created by flick
        </Button>,
      ],
    };
  }
});

export const GET = handleRequest;
export const POST = handleRequest;
