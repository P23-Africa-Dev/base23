import images from "@/constants/image";
import { ReactNode, type PropsWithChildren } from "react";

interface AuthLayoutProps {
  LeftDesktopContent?: ReactNode;
  mobileTopContent?: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthSimpleLayout({
  title,
  subtitle,
  mobileTopContent,
  LeftDesktopContent,
  children,
}: PropsWithChildren<AuthLayoutProps>) {
  return (
    <>
      <div className="relative min-h-svh w-full items-start bg-white md:flex md:h-screen lg:bg-transparent dark:bg-gray-900 dark:lg:bg-transparent">
        {LeftDesktopContent}

        {/* Mobile Pattern Screen and Topcontent */}
        {mobileTopContent}

        {/* Right Side Desktop and Mobile (Scrollable) */}
        <div
          style={{
            backgroundImage: `url(${images.formBG})`,
          }}
          className={`relative z-10 mx-auto flex flex-col justify-center items-center w-full bg-white md:h-screen md:w-2/4 lg:justify-end xl:w-full xl:justify-center dark:bg-gray-900 ${
            mobileTopContent
              ? "min-h-[calc(100svh-260px)] md:min-h-0"
              : "min-h-svh md:min-h-0"
          }`}
        >
          <div className="w-full lg:w-auto lg:min-w-116.5">
            {(title || subtitle) && (
              <div className="px-5 pt-8 md:px-0 md:pt-0">
                <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[#0B1727]">
                  {title}
                </h2>
                <p className="text-[14px] sm:text-[16px] text-[#0B1727] mb-4.75 tracking-[0.5px] max-w-110.5">
                  {subtitle}
                </p>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
