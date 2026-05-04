"use client";

export const dynamic = "force-dynamic";

import images from "@/constants/image";
import Image from "next/image";
import Link from "next/link";

export default function UnderConstruction() {
  return (
    <div className="relative h-screen w-full items-start bg-white md:flex">
      {/* ── Left dark panel (desktop) ── */}
      <div className="md:w-2/4">
        <div
          className="fixed hidden h-full w-5/12 z-40 bg-center bg-cover text-white md:flex flex-col justify-between py-12 xl:w-[35%]"
          style={{ backgroundImage: `url(${images.stepFormsBg})` }}
        >
          {/* Inner edge pattern */}
          <div
            className="absolute top-0 -right-7 z-0 h-full bg-cover bg-center w-[30px]"
            style={{ backgroundImage: `url(${images.stepFormsInnerPattern})` }}
          >
            <div className="w-full h-full bg-gradient-to-r from-primary/60 dark:from-black from-12% via-primary/0 via-30%" />
          </div>

          {/* Logo */}
          <div className="relative z-10 px-10">
            <Image
              src={images.fulllogo}
              alt="NOEL"
              width={140}
              height={40}
              className="h-auto w-32 object-contain"
            />
          </div>

          {/* Center copy */}
          <div className="relative z-10 px-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2ABFBB]/40 bg-[#2ABFBB]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2ABFBB]" />
              <span className="font-montserrat text-xs font-medium uppercase tracking-[2px] text-[#2ABFBB]">
                In Progress
              </span>
            </div>

            <h1 className="font-Gtrials text-[52px] font-normal leading-[1.1] text-[#F3F0E9] xl:text-[64px]">
              We&apos;re building
              <br />
              <span className="text-[#2ABFBB]">something</span>
              <br />
              extraordinary.
            </h1>

            <p className="font-montserrat mt-5 max-w-xs text-[13px] font-light leading-relaxed text-[#F3F0E9]/70 tracking-[0.3px]">
              The Business Referral Network is getting a new home. Our team is
              working hard to bring you a better experience.
            </p>
          </div>

          {/* Bottom tagline */}
          <div className="relative z-10 px-10">
            <p className="font-montserrat text-xs font-light text-[#F3F0E9]/40 tracking-[1px] uppercase">
              NOEL — Business Referral Network
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile top banner ── */}
      <div
        className="relative flex h-[42vh] w-full flex-col justify-between bg-cover bg-center px-7 py-8 md:hidden"
        style={{ backgroundImage: `url(${images.stepFormsBg})` }}
      >
        <Image
          src={images.fulllogo}
          alt="NOEL"
          width={120}
          height={36}
          className="h-auto w-28 object-contain"
        />

        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#2ABFBB]/40 bg-[#2ABFBB]/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2ABFBB]" />
            <span className="font-montserrat text-[10px] font-medium uppercase tracking-[2px] text-[#2ABFBB]">
              In Progress
            </span>
          </div>
          <h2 className="font-Gtrials text-[36px] font-normal leading-tight text-[#F3F0E9]">
            We&apos;re building
            <br />
            <span className="text-[#2ABFBB]">something</span>
            <br />
            great.
          </h2>
        </div>

        {/* Wave decoration bottom of mobile banner */}
        <Image
          src={images.bottomFormBgP}
          className="absolute bottom-0 left-0 z-0 h-auto w-full object-cover"
          fill
          alt=""
          style={{ objectPosition: "bottom" }}
        />
      </div>

      {/* ── Right panel — CTA ── */}
      <div
        className="relative z-10 mx-auto flex h-full w-full flex-col items-center justify-center bg-white px-6 md:h-screen md:w-2/4 xl:w-full"
        style={{ backgroundImage: `url(${images.formBG})` }}
      >
        <div className="w-full max-w-md xl:max-w-[420px]">
          {/* Desktop logo (small, top) */}
          <div className="mb-10 hidden md:block">
            <span className="font-montserrat text-xs font-semibold uppercase tracking-[2px] text-[#8C9AA6]">
              Platform Access
            </span>
          </div>

          <h2 className="font-montserrat text-[32px] font-extrabold leading-tight text-[#0B1727] md:text-[36px]">
            Already a member?
          </h2>
          <p className="font-montserrat mt-2 mb-10 text-[15px] font-light text-[#0B1727]/60 tracking-[0.3px] max-w-sm">
            Log in to access your account or sign up to join the network while
            we prepare the new experience.
          </p>

          {/* Primary — Login */}
          <Link
            href="/login"
            className="font-montserrat mb-4 flex w-full items-center justify-center rounded-2xl bg-[#2ABFBB] py-[18px] text-[17px] font-semibold text-white transition-all duration-200 hover:bg-[#2ABFBB]/90 active:scale-[0.98]"
          >
            Log In
          </Link>

          {/* Secondary — Register */}
          <Link
            href="/register"
            className="font-montserrat flex w-full items-center justify-center rounded-2xl border-2 border-[#0B1727]/20 py-[17px] text-[17px] font-semibold text-[#0B1727] transition-all duration-200 hover:border-[#0B1727]/40 hover:bg-[#0B1727]/[0.03] active:scale-[0.98]"
          >
            Create an Account
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#0B1727]/10" />
            <span className="font-montserrat text-xs text-[#0B1727]/30 tracking-[1px] uppercase">
              Need help?
            </span>
            <div className="h-px flex-1 bg-[#0B1727]/10" />
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/help"
              className="font-montserrat text-sm font-medium italic text-[#0B1727]/50 underline-offset-2 hover:underline hover:text-[#0B1727]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
