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
      <div className="relative h-screen w-full items-start bg-white md:flex lg:bg-transparent dark:bg-gray-900 dark:lg:bg-transparent">
        {LeftDesktopContent}

        {/* Mobile Pattern Screen and Topcontent */}
        {mobileTopContent}

        {/* Right Side Desktop and Mobile (Scrollable) */}
        <div
          style={{
            backgroundImage: `url(${images.formBG})`,
          }}
          className="relative z-10 mx-auto flex flex-col justify-center items-center w-full bg-white md:h-screen md:w-2/4 lg:justify-end xl:w-full xl:justify-center dark:bg-gray-900"
        >
          <div className="min-w-116.5">
            <div>
              <h2 className="text-[36px] font-extrabold text-[#0B1727]">
                {title}
              </h2>
              <p className="text-[16px] text-[#0B1727] mb-4.75 tracking-[0.5px] max-w-110.5">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
