/* eslint-disable @next/next/no-img-element */
import "@/graphql/airstack";
import { formatEther } from "viem";
import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "@vercel/og";
import { fetchCast } from "@/neynar/cast";
import { fetchQuery } from "@airstack/node";
import {
  SocialCapitalQuery,
  SocialCapitalQueryVariables,
} from "@/graphql/types";
import path from "path";
import { tmpdir } from "os";
import { promises as fs } from "fs";
import Canvas, { deregisterAllFonts, registerFont } from "canvas";
import { baseUrl } from "@/config";

// load font from baseUrl/fonts/Roboto-Medium.ttf
const promiseFonts = fetch(`${baseUrl}/fonts/Roboto-Medium.ttf`)
  .then(async (response) => {
    const data = await response.arrayBuffer();
    await fs.writeFile(
      path.join(tmpdir(), "Roboto-Medium.ttf"),
      Buffer.from(data),
    );
    deregisterAllFonts();
    registerFont(path.join(tmpdir(), "Roboto-Medium.ttf"), {
      family: "Roboto",
    });
  })
  .catch((error) => {
    console.error("Failed to load font", error);
  });

export async function GET(
  req: NextRequest,
  { params }: { params: { castHash: string } },
) {
  await promiseFonts;

  const response = await fetchCast({
    identifier: params.castHash,
    type: "hash",
  });

  const { cast } = response;

  const imagePfp = cast.author?.pfp_url;
  const text = cast.text;
  const name = cast.author?.username;

  let rank: number | null = null;
  let moxieAmount: number | null = null;

  const canvas = Canvas.createCanvas(576, 576);

  const ctx = canvas.getContext("2d");
  const pfpImage = await Canvas.loadImage(imagePfp);

  const sx =
    pfpImage.width > pfpImage.height
      ? (pfpImage.width - pfpImage.height) / 2
      : 0;
  const sy =
    pfpImage.height > pfpImage.width
      ? (pfpImage.height - pfpImage.width) / 2
      : 0;
  const sWidth = Math.min(pfpImage.width, pfpImage.height);
  const sHeight = Math.min(pfpImage.width, pfpImage.height);

  ctx.drawImage(pfpImage, sx, sy, sWidth, sHeight, 0, 0, 576, 576); // Draw the image with 1:1 aspect ratio

  // use black text to draw the rank inside the badge
  const rankText = `#${rank}`;
  ctx.fillStyle = "black";
  ctx.font = `${rankText.length < 3 ? 28 : 28 - Math.min((rankText.length - 3) * 4, 20)}px Roboto`;

  const rankTextDimensions = ctx.measureText(rankText);
  ctx.fillText(
    rankText,
    16 + 96 / 2 - rankTextDimensions.width / 2,
    576 + rankTextDimensions.actualBoundingBoxAscent / 2 - 96 / 2 - 16,
  );

  // Create gradient
  const grd = ctx.createLinearGradient(0, 576 / 2, 576, 576 / 2);
  grd.addColorStop(0, "rgba(255, 255, 255, 1)");
  grd.addColorStop(0.65, "rgba(255, 255, 255, 1)");
  grd.addColorStop(1, "rgba(255, 255, 255, 0)");

  // Apply gradient as globalCompositeOperation to create fade out effect
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 576, 576);

  const imgUrl = canvas.toDataURL("image/png");
  // Filter out any words that are a URL
  const textNoUrls = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
  const paragraphs = textNoUrls.split(/\n+/);

  let fontSize: number;
  if (text.length < 64) {
    fontSize = 32;
  } else if (text.length > 200) {
    fontSize = 20;
  } else {
    fontSize = 24;
  }

  fontSize -= Math.floor(paragraphs.length / 2);
  fontSize = Math.max(fontSize, 10);

  let signOff = `@${name}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          width: "100%",
          height: "100vh",
          backgroundColor: "black",
        }}
      >
        <img src={imgUrl} alt="" width="576px" height="576px" />
        <div
          style={{
            display: "flex",
            width: "50%",
            backgroundColor: "black",
            justifyContent: "center",
            backgroundSize: "100% 100%",
            fontWeight: 400,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              paddingRight: "42px",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                height: "100%",
                overflow: "hidden",

                // a little line spacing
                lineHeight: "1.5em",
              }}
            >
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    fontSize,
                    width: "100%",
                    textAlign: "left",
                    paddingRight: "32px",
                  }}
                >
                  {paragraph}
                </p>
              ))}
              <p
                style={{
                  fontSize: "24px",
                  // light purple
                  color: "#D6B8FF",
                }}
              >
                {signOff}
              </p>
            </div>
          </div>
        </div>
        <p
          style={{
            position: "absolute",
            bottom: "16px",
            right: "32px",
            color: "white",
            fontFamily: "Roboto",
            fontSize: "16px",
          }}
        >
          make it a quote by @flick
        </p>
      </div>
    ),
    {
      width: 1100,
      height: 576,
    },
  );
}
