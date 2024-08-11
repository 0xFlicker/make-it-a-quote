import { PfpEditor } from "@/features/editor/components/PfpEditor";
import React from "react";
import { DefaultProvider } from "../default";
import { fetchCast } from "@/neynar/cast";
import { isAddress } from "viem";

const MainPage = async ({ params }: { params: { castId: string } }) => {
  if (!isAddress(params.castId)) {
    return <div>Invalid cast id</div>;
  }
  const { cast } = await fetchCast({
    identifier: params.castId,
    type: "hash",
  });
  if (!cast) {
    return <div>Cast not found</div>;
  }
  const embeds = cast.embeds?.map((embed) => embed.url);
  console.log(embeds);
  return (
    <>
      <DefaultProvider>
        <PfpEditor embeds={embeds} />
      </DefaultProvider>
      {/* <main className="">
        <div className="flex flex-col justify-center items-center container md:flex-row overflow-hidden bg-main pt-10 xl:pt-20 px-2 md:px-2 lg:px-4">

        </div>
      </main> */}
    </>
  );
};

export default MainPage;
