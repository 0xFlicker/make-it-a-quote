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

deregisterAllFonts();
// load font from baseUrl/fonts/Roboto-Medium.ttf
const promiseFonts = fetch(`${baseUrl}/fonts/Roboto-Medium.ttf`).then(
  async (response) => {
    const data = await response.arrayBuffer();
    await fs.writeFile(
      path.join(tmpdir(), "Roboto-Medium.ttf"),
      Buffer.from(data),
    );
    registerFont(path.join(tmpdir(), "Roboto-Medium.ttf"), {
      family: "Roboto",
    });
  },
);
const socialCapitalQuery = /* GraphQL */ `
  query SocialCapital($identity: Identity!, $castHash: String!) {
    Socials(
      input: {
        filter: { dappName: { _eq: farcaster }, identity: { _eq: $identity } }
        blockchain: ethereum
      }
    ) {
      Social {
        farcasterScore {
          farRank
        }
      }
    }
    FarcasterCasts(
      input: { filter: { hash: { _eq: $castHash } }, blockchain: ALL }
    ) {
      Cast {
        moxieEarningsSplit {
          earnerType
          earningsAmount
          earningsAmountInWei
        }
      }
    }
    FarcasterReplies(
      input: { filter: { hash: { _eq: $castHash } }, blockchain: ALL }
    ) {
      Reply {
        moxieEarningsSplit {
          earnerType
          earningsAmount
          earningsAmountInWei
        }
      }
    }
  }
`;

interface SocialCapitalQueryResponse {
  data: SocialCapitalQuery | null;
  error: Error | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { castHash: string } },
) {
  await promiseFonts;
  const { cast } = await fetchCast({
    identifier: params.castHash,
    type: "hash",
  });

  const { data, error }: SocialCapitalQueryResponse = await fetchQuery(
    socialCapitalQuery,
    {
      identity: `fc_fid:${cast.author?.fid}`,
      castHash: params.castHash,
    } as SocialCapitalQueryVariables,
  );

  const imagePfp = cast.author?.pfp_url;
  const text = cast.text;
  const name = cast.author?.username;

  let rank: number | null = null;
  let moxieAmount: number | null = null;
  if (!error && data) {
    if (Number(data.Socials?.Social?.length) > 1) {
      console.warn(
        `More than one social capital found for ${cast.parent_url}`,
        data.Socials,
      );
    }
    const farRank = Number(data.Socials?.Social?.[0]?.farcasterScore?.farRank);
    if (Number(data.Socials?.Social?.length) > 0 && !Number.isNaN(farRank)) {
      rank = farRank;
    }
    if (
      Number(data.FarcasterCasts?.Cast?.length) > 1 ||
      Number(data.FarcasterReplies?.Reply?.length) > 1
    ) {
      console.warn(
        `More than one social capital found for ${cast.parent_url}`,
        data.FarcasterCasts,
        data.FarcasterReplies,
      );
    }
    const replyOrCast =
      data.FarcasterReplies?.Reply?.[0] ?? data.FarcasterCasts?.Cast?.[0];

    if (replyOrCast?.moxieEarningsSplit) {
      const castScore = replyOrCast?.moxieEarningsSplit?.reduce(
        (acc, result) => {
          if (result) {
            const { earningsAmountInWei } = result;
            if (earningsAmountInWei) {
              return acc + BigInt(earningsAmountInWei);
            }
          }
          return acc;
        },
        0n,
      );
      moxieAmount = Number(formatEther(castScore));
    }
  }
  if (error) {
    console.error(error);
  }
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

  // Now draw a badge in lower left with SCS score
  const badgeImage = await Canvas.loadImage(`${baseUrl}/badge.png`);
  ctx.drawImage(badgeImage, 16, 576 - 96 - 16, 96, 96);
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

  // Write "FarRank" above the badge, centered
  ctx.fillStyle = "black";
  ctx.font = "24px Roboto";
  ctx.textAlign = "center";
  ctx.fillText("FarRank", 16 + 96 / 2, 576 - 96 - 16 - 8);

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
  let moxieAmountString = "";
  if (moxieAmount != null && moxieAmount > 0) {
    // if moxieAmount is > 1, then trim the decimal places, other wise show 2 decimal places
    moxieAmountString =
      moxieAmount > 1 ? moxieAmount.toFixed(0) : moxieAmount.toFixed(2);
    // signOff = `@${name} | ${moxieAmountString} Ⓜ️`;
  }
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
              width: "100%",
              height: "100%",
            }}
          >
            {moxieAmountString && (
              <p
                style={{
                  alignSelf: "flex-end",
                  justifySelf: "flex-start",
                  textAlign: "right",
                  fontSize: "24px",
                  marginRight: "42px",
                  // light purple
                  color: "#D6B8FF",
                }}
              >{`${moxieAmountString} Ⓜ️`}</p>
            )}
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
