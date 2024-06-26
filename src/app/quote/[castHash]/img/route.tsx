/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "@vercel/og";
import { fetchCast } from "@/neynar/cast";
import Canvas from "canvas";

export async function GET(
  req: NextRequest,
  { params }: { params: { castHash: string } },
) {
  const { cast } = await fetchCast({
    identifier: params.castHash,
    type: "hash",
  });

  const imagePfp = cast.author?.pfp_url;
  const text = cast.text;
  const name = cast.author?.username;

  const canvas = Canvas.createCanvas(576, 576);

  const ctx = canvas.getContext("2d");
  const image = await Canvas.loadImage(imagePfp);

  const sx = image.width > image.height ? (image.width - image.height) / 2 : 0;
  const sy = image.height > image.width ? (image.height - image.width) / 2 : 0;
  const sWidth = Math.min(image.width, image.height);
  const sHeight = Math.min(image.width, image.height);

  ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, 576, 576); // Draw the image with 1:1 aspect ratio

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
            height: "100%",
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
              justifyContent: "center",
              alignItems: "center",
              color: "white",
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
            >{`@${name}`}</p>
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
