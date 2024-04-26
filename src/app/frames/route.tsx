/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
import { fetchCast } from "@/neynar/cast";
import { baseUrl } from "@/config";

const handleRequest = frames(async (ctx) => {
  try {
    const messageHash = ctx.message?.castId?.hash;
    const inputText = ctx.message?.inputText;

    if (!messageHash && !inputText) {
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
              <p>drop quote.flick.ing in the reply to a cast</p>
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
        textInput: "Cast url or hash",
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

    let identifier: string;
    let type: "hash" | "url" = "url";
    if (inputText && inputText.length > 0) {
      // if starts with 0x, it's a hash
      if (inputText.startsWith("0x")) {
        identifier = inputText;
        type = "hash";
      } else {
        const url = new URL(inputText);
        if (url.hostname !== "warpcast.com") {
          identifier = url.pathname.split("/").pop()!;
          type = "hash";
        } else {
          identifier = inputText;
        }
      }
    } else {
      identifier = messageHash!;
      type = "hash";
    }

    if (!identifier) {
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
        textInput: "Cast url or hash",
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

    console.log({ identifier, type, messageHash, inputText });

    const { cast } = await fetchCast({
      identifier,
      type,
    });

    console.log({
      hash: cast?.hash,
      parent_hash: cast?.parent_hash,
      messageHash,
    });

    const ogImage = `${baseUrl}/quote/${cast?.parent_hash ?? cast?.hash ?? messageHash}`;
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
