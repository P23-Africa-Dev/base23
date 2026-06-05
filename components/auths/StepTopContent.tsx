import React from "react";
import { twMerge } from "tailwind-merge";

interface StepTopContentProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  steps?: string[];
  currentStep?: number;
  headingClassName?: string;
  containerClassName?: string;
  spanElement?: React.ReactNode;
}

const StepTopContent: React.FC<StepTopContentProps> = ({
  title,
  description,
  children,
  headingClassName,
  containerClassName,
  spanElement,
}) => (
  <div
    className={twMerge("px-4 lg:px-0 w-[400px] mx-auto", containerClassName)}
  >
    <div className="pl-10 ">
      <h3
        className={twMerge(
          "max-w-[230px] leading-12 text-3xl md:text-4xl font-semibold text-secondary dark:text-white mb-3",
          headingClassName,
        )}
      >
        {title}
        {spanElement && (
          <span className="font-semibold">
            {" "}
            <br /> {spanElement}
          </span>
        )}
      </h3>

      <p className="text-sm text-secondary dark:text-white font-extralight mb-6 max-w-sm  pr-20">
        {description}
      </p>
    </div>

    {children}
  </div>
);

export default StepTopContent;
