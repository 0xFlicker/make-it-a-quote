import { fetchCast as fetchCastNeynar } from "@/neynar/cast";

export async function fetchCast(inputText: string) {
  let identifier: string = inputText;
  let type: "hash" | "url" = "url";
  let loadParent = false;
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
  }
  return await fetchCastNeynar({
    identifier,
    type,
  });
}
