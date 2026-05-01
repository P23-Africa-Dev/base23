import images from "@/constants/image";
import React from "react";
import StepBottomContent from "./StepBottomContent";

interface LeftDesktopContent {
  steps?: string[];
  currentStep?: number;
  step?: number;
  topContentLayout?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

const LeftDesktopContent: React.FC<LeftDesktopContent> = ({
  topContentLayout,
  bottomContent,
}) => (
  <div className="md:w-2/4">
    <div
      className="fixed hidden h-full w-5/12 z-40 bg-center text-white md:block xl:w-[35%]"
      style={{
        backgroundImage: `url(${images.stepFormsBg})`,
      }}
    >
      <div
        className="absolute top-0 -right-7 z-0 h-full bg-cover bg-center text-white md:w-[30px]"
        style={{
          backgroundImage: `url(${images.stepFormsInnerPattern})`,
        }}
      >
        <div className=" w-full h-full bg-gradient-to-r from-primary/60 dark:from-black from-12% via-primary/0 via-30%"></div>
      </div>

      <div className="flex h-screen flex-col justify-between py-10">
        {topContentLayout}
        <StepBottomContent content={bottomContent} />
      </div>
    </div>
  </div>
);

export default LeftDesktopContent;
