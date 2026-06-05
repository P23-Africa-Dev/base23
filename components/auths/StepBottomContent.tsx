import images from "@/constants/image";
import Image from "next/image";

const StepBottomContent = ({ content }: { content?: React.ReactNode }) => {
  return (
    <>
      <div>
        <div className="">
          <Image
            src={images.stepFormsPattern}
            alt="Bottom Decoration"
            className="w-full object-cover"
            width={200}
            height={100}
          />
        </div>

        {/* Bottom Text */}
        <div className="text-left px-4 lg:px-0 w-[400px] mx-auto mt-10   ">
          {content}
        </div>
      </div>
    </>
  );
};

export default StepBottomContent;
