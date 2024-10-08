/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { baseUrl } from "@/config";
import { createPublicClient, http, isAddress, parseAbi } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({
  transport: http(process.env.BASE_RPC_URL_1!, {
    batch: true,
    retryCount: 5,
    retryDelay: 100,
  }),
  chain: base,
});

export async function fetchDepositEvent(address: `0x${string}`) {
  return await client.readContract({
    address: "0xa8a30e0dafca4156f28d96cca5671a0eeca5e407",
    abi: [
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "depositTimestamps",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "depositTimestamps",
    args: [address],
  });
}

async function fetchLockDuration() {
  return await client.readContract({
    address: "0xa8a30e0dafca4156f28d96cca5671a0eeca5e407",
    abi: [
      {
        inputs: [],
        name: "lockDuration",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "lockDuration",
  });
}

export async function processDegenUnlock(senderAddresses: `0x${string}`[]) {
  try {
    const [lockDuration, addressTimeStamps] = await Promise.all([
      fetchLockDuration(),
      Promise.all(senderAddresses.map(fetchDepositEvent)),
    ]);

    const validEntries = addressTimeStamps
      .map((v) => v)
      .filter((v) => v > 0)
      .map((v) => Number(v));
    const unlockTime = validEntries.length > 0 ? Math.min(...validEntries) : 0;

    if (unlockTime === 0) {
      return {
        image: (
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
            <p>No $DEGEN deposits found</p>
          </div>
        ),
        unlockDate: null,
      };
    }

    const unlockDate = new Date((unlockTime + Number(lockDuration)) * 1000);
    const formattedUnlockDate = unlockDate.toUTCString();

    // if unlock date is in the past, let people know
    const isPast = unlockDate.getTime() < Date.now();

    return {
      image: (
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
          <p>$DEGEN unlock time (UTC)</p>
          <p style={{ fontSize: "24px" }}>{formattedUnlockDate}</p>
          {isPast && <p>Unlock time is in the past</p>}
        </div>
      ),
      buttons: [
        <Button action="post">🔎 mine</Button>,
        <Button action="link" target="https://warpcast.com/flick/0x1f50f7b1">
          created by flick
        </Button>,
        <Button
          action="link"
          target={`https://warpcast.com/~/add-cast-action?url=${`${baseUrl}/action/degen-unlock`}`}
        >
          action
        </Button>,
      ],
    };
  } catch (error) {
    console.error(error);
    return {
      image: <span>error</span>,
      buttons: [
        <Button action="post">🔎 mine</Button>,
        <Button action="link" target={baseUrl}>
          share
        </Button>,
        <Button action="link" target="https://warpcast.com/flick/0x1f50f7b1">
          created by flick
        </Button>,
        <Button
          action="link"
          target={`https://warpcast.com/~/add-cast-action?url=${`${baseUrl}/action/degen-unlock`}`}
        >
          action
        </Button>,
      ],
    };
  }
}
