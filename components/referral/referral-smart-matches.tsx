import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

import images from "@/constants/image";
import Image from "next/image";

const data = [
  { value: 20 },
  { value: 40 },
  { value: 30 },
  { value: 55 },
  { value: 48 },
  { value: 75 },
  { value: 65 },
];

export default function ReferralSmartMatchChart() {
  const handleProfileSetupClick = () => {
    window.location.href = "/profile?tab=company";
  };

  return (
    <div className="flex gap-2.5 sm:gap-3.5 w-full h-full">
      <div className="flex h-36 sm:h-40 lg:h-40 xl:h-43 2xl:h-47.5 w-12 sm:w-15 lg:w-16 xl:w-18 flex-col items-center justify-between rounded-2xl bg-[#22272A] pt-3 sm:pt-5 lg:pt-6 2xl:pt-9 pb-2.5 text-white shadow shrink-0">
        <p className="-rotate-90 text-xs sm:text-sm font-bold tracking-widest text-white whitespace-nowrap">
          1000+
        </p>

        <div className="flex flex-col items-center gap-3 sm:gap-5 lg:gap-5 2xl:gap-7">
          <p className="-rotate-90 text-[8px] sm:text-[9px] text-white whitespace-nowrap">Sales Agents</p>
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full border border-white/20">
            <Image
              src={images.matches}
              className="h-2.5 w-2.5 object-contain"
              alt=""
              width={10}
              height={10}
            />
          </div>
        </div>
      </div>
      <div className="relative flex-1 lg:mr-0 2xl:mr-14 h-36 sm:h-40 lg:h-40 xl:h-43 2xl:h-47.5 rounded-2xl bg-[#CDCADB] p-3 sm:p-5 lg:p-5 xl:p-6 shadow-[2px_5px_5px_-4px_rgba(0,0,0,0.3),-2px_3px_5px_-1px_rgba(0,0,0,0.3)] overflow-hidden 2xl:overflow-visible">
        {/* Floating profile badge - Clickable */}
        <div
          onClick={handleProfileSetupClick}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 lg:top-3 lg:right-3 2xl:top-4 2xl:-right-12 z-10 cursor-pointer rounded-xl bg-[#D6F955] px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-3 lg:py-2.5 2xl:px-4 2xl:py-3.5 text-[#22272A] shadow-[2px_5px_5px_-4px_rgba(0,0,0,0.4),-2px_3px_5px_-1px_rgba(0,0,0,0.4)] transition-all hover:scale-105 hover:shadow-[2px_7px_7px_-4px_rgba(0,0,0,0.5),-2px_5px_7px_-1px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 2xl:gap-8">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center text-[7px] sm:text-[8px] font-bold">
                <img
                  src={images.aiCurve}
                  className="absolute h-full w-full"
                  alt=""
                />
                Ai
              </div>
              <div className="leading-tight text-deepBlack">
                <h3 className="text-[7.5px] sm:text-[9px] font-medium whitespace-nowrap">
                  Smart Matching{" "}
                </h3>
                <p className="text-[9px] sm:text-[11px] font-bold whitespace-nowrap">
                  Profile Set-up
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm lg:text-base font-extrabold text-deepBlack">92%</p>
          </div>
        </div>

        {/* Label */}
        <div className="text-lg sm:text-xl lg:text-xl xl:text-2xl leading-tight absolute bottom-2.5 left-3.5 sm:bottom-3 sm:left-5 lg:bottom-9 xl:bottom-11 2xl:bottom-14 lg:left-5 font-bold text-[#FFFFFF] z-10">
          800+
          <div className="text-[8px] sm:text-[9px] font-medium text-[#454545]">
            Smart Matches
          </div>
        </div>

        {/* Line Chart */}
        <div className="absolute right-0 bottom-0 w-full left-0 flex justify-end items-end h-full pointer-events-none">
          <div className="h-[55%] lg:h-[50%] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Tooltip content={() => null} />
                <Line
                  type="basis"
                  dataKey="value"
                  stroke="#22272A"
                  strokeWidth={3.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
