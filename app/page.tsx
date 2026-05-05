"use client";

export const dynamic = "force-dynamic";

import LeftDesktopContent from "@/components/auths/LeftDesktopContent";
import AuthLayout from "@/layouts/auth-layout";
import Link from "next/link";
import ArrowRight from "@/public/assets/arrow-right.png";
import Building from "@/public/assets/building-02.png";
import AgentIcon from "@/public/assets/user-circle.png";
import Image from "next/image";

const options = [
  {
    label: "Company",
    title: "I'm Hiring",
    description:
      "Find verified sales agents ready to work in your target markets. Post roles, browse profiles, and hire with confidence.",
    icon: (
      <Image
        src={Building}
        alt=""
        className="h-13.75 w-13.75 text-white mr-2"
      />
    ),
    iconBg: "bg-[#CD3072]",
    href: "/register",
  },
  {
    label: "Agent",
    title: "I'm a Sales Agent",
    description:
      "List your experience, get verified, and connect with companies hiring across Africa. Build your profile once and let opportunities find you.",
    icon: (
      <Image src={AgentIcon} alt="" className="h-13 w-13 text-white mr-2" />
    ),
    iconBg: "bg-[#5054D4]",
    href: "/register",
  },
];

export default function LandingPage() {
  return (
    <AuthLayout
      title="Welcome to Base 23"
      subtitle="To begin, select which best describes you."
      LeftDesktopContent={
        <LeftDesktopContent
          topContentLayout={
            <div className="max-w-77 mx-auto mt-[25%] w-fit pr-4">
              <h2 className="text-[36px] font-extrabold text-[#F3F0E9]">
                Base 23
              </h2>
              <p className="text-[13px] max-w-69.75 text-[#F3F0E9] mb-4.75 tracking-[0.5px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor
              </p>
            </div>
          }
          bottomContent={
            <div className="w-fit text-base mx-auto my-[15%] pr-10">
              <p className="mb-1 font-light">
                Already have an account?{" "}
                <Link href="/login" className="font-medium italic">
                  Sign In
                </Link>
              </p>
              <p>
                <Link
                  href="/help"
                  className="font-medium italic hover:underline dark:text-deepBlack"
                >
                  Need Help?
                </Link>
              </p>
            </div>
          }
        />
      }
    >
      <div className="w-124.25 flex flex-col gap-5 mt-8">
        {options.map((opt) => (
          <Link
            key={opt.title}
            href={opt.href}
            className="flex items-center gap-3.75 rounded-[20px] bg-[#0B1727] px-6 pl-9 py-5 cursor-pointer hover:bg-[#0d1e35] transition-colors group"
          >
            <div className="relative shrink-0">
              <div
                className={`flex h-27.5 w-25.25 items-center justify-center rounded-r-[50px] ${opt.iconBg}`}
              >
                {opt.icon}
              </div>
              <span
                className="absolute -left-1.5 top-0 bottom-0 -translate-x-full flex items-center justify-center text-[12px] leading-6 font-light text-white/50 tracking-widest"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {opt.label}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-6 font-semibold text-white mb-1">
                {opt.title}
              </p>
              <p className="text-[12px] leading-4 text-[#F6F6F6]">
                {opt.description}
              </p>
            </div>

            <Image
              src={ArrowRight}
              alt="Arrow Right"
              className="shrink-0 self-baseline h-5 w-5 text-[#F6F6F6] group-hover:text-white transition-colors"
            />
          </Link>
        ))}
      </div>
    </AuthLayout>
  );
}
