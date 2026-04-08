import { NextResponse } from "next/server";

const SNAP_CONTENT_TYPE = "application/vnd.farcaster.snap+json";

export function snapResponse(body: Record<string, unknown>) {
  return NextResponse.json(body, {
    headers: {
      "Content-Type": SNAP_CONTENT_TYPE,
      Vary: "Accept",
    },
  });
}

export function snapQuotePage({
  castHash,
  text,
  username,
  baseUrl,
}: {
  castHash: string;
  text: string;
  username: string;
  baseUrl: string;
}) {
  const imageUrl = `${baseUrl}/quote/${castHash}/img`;
  const quoteUrl = `${baseUrl}/quote/${castHash}`;

  // Snap text limit is 320 chars; account for `"..."` + ` — @username`
  const overhead = 6 + username.length;
  const maxText = 320 - overhead;
  const preview =
    text.length > maxText ? text.substring(0, maxText - 3) + "..." : text;

  return snapResponse({
    version: "1.0",
    theme: { accent: "purple" },
    ui: {
      root: "page",
      elements: {
        page: {
          type: "stack",
          props: {},
          children: ["img", "attribution", "actions"],
        },
        img: {
          type: "image",
          props: { url: imageUrl, aspect: "16:9" },
        },
        attribution: {
          type: "text",
          props: {
            content: `"${preview}" \u2014 @${username}`,
            size: "sm",
          },
        },
        actions: {
          type: "stack",
          props: { direction: "horizontal" },
          children: ["share-btn", "open-btn"],
        },
        "share-btn": {
          type: "button",
          props: { label: "Share quote", variant: "primary" },
          on: {
            press: {
              action: "compose_cast",
              params: {
                embeds: [quoteUrl],
              },
            },
          },
        },
        "open-btn": {
          type: "button",
          props: { label: "by @flick" },
          on: {
            press: {
              action: "view_profile",
              params: { fid: 6097 },
            },
          },
        },
      },
    },
  });
}

export function snapInputPage(baseUrl: string) {
  return snapResponse({
    version: "1.0",
    theme: { accent: "purple" },
    ui: {
      root: "page",
      elements: {
        page: {
          type: "stack",
          props: {},
          children: ["title", "desc", "cast-input", "submit-btn"],
        },
        title: {
          type: "text",
          props: { content: "Make it a quote", weight: "bold" },
        },
        desc: {
          type: "text",
          props: {
            content: "Paste a Warpcast URL or cast hash to generate a quote image.",
            size: "sm",
          },
        },
        "cast-input": {
          type: "input",
          props: {
            name: "cast",
            label: "Cast URL or hash",
            placeholder: "https://farcaster.com/... or 0x...",
            maxLength: 280,
          },
        },
        "submit-btn": {
          type: "button",
          props: { label: "Make it a quote", variant: "primary" },
          on: {
            press: {
              action: "submit",
              params: { target: `${baseUrl}/api/snap` },
            },
          },
        },
      },
    },
  });
}

export function snapErrorPage(message: string, baseUrl: string) {
  return snapResponse({
    version: "1.0",
    theme: { accent: "red" },
    ui: {
      root: "page",
      elements: {
        page: {
          type: "stack",
          props: {},
          children: ["title", "error", "retry-btn"],
        },
        title: {
          type: "text",
          props: { content: "Something went wrong", weight: "bold" },
        },
        error: {
          type: "text",
          props: { content: message, size: "sm" },
        },
        "retry-btn": {
          type: "button",
          props: { label: "Try again", variant: "primary" },
          on: {
            press: {
              action: "submit",
              params: { target: `${baseUrl}/api/snap` },
            },
          },
        },
      },
    },
  });
}
