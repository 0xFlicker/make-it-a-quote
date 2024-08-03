import { PfpEditor } from "@/features/editor/components/PfpEditor";
import React from "react";
import { DefaultProvider } from "./default";

const MainPage = () => {
  return (
    <>
      <main className="">
        <div className="flex flex-col justify-center items-center container md:flex-row overflow-hidden bg-main pt-10 xl:pt-20 px-2 md:px-2 lg:px-4">
          <DefaultProvider>
            <PfpEditor />
          </DefaultProvider>
        </div>
      </main>
    </>
  );
};

export default MainPage;
