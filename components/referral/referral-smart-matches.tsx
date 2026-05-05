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
    <div className="flex gap-4">
      <div className="flex h-[190px] w-[72px] flex-col items-center justify-between rounded-2xl bg-[#22272A] pt-9 pb-3 text-white shadow">
        <p className="-rotate-90 text-sm font-bold tracking-widest text-white">
          1000+
        </p>

        <div className="flex flex-col items-center gap-7">
          <p className="-rotate-90 text-[9px] text-white">Connections</p>
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full border">
            <Image
              src={images.matches}
              className="absolute h-2.5 w-2.5 object-contain"
              alt=""
              width={10}
              height={10}
            />
          </div>
        </div>
      </div>
      <div className="relative mr-16 h-[190px] w-[60%] rounded-2xl bg-[#CDCADB] p-8 shadow-[2px_5px_5px_-4px_rgba(0,0,0,0.3),-2px_3px_5px_-1px_rgba(0,0,0,0.3)]">
        {/* Floating profile badge - Clickable */}
        <div
          onClick={handleProfileSetupClick}
          className="absolute top-5 -right-10 cursor-pointer rounded-xl bg-[#D6F955] px-4 py-5 text-[#22272A] shadow-[2px_5px_5px_-4px_rgba(0,0,0,0.4),-2px_3px_5px_-1px_rgba(0,0,0,0.4)] transition-all hover:scale-105 hover:shadow-[2px_7px_7px_-4px_rgba(0,0,0,0.5),-2px_5px_7px_-1px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-1">
              <div className="relative flex h-5 w-5 items-center justify-center text-[8px]">
                <img
                  src={images.aiCurve}
                  className="absolute h-full w-full"
                  alt=""
                />
                Ai
              </div>
              <div className="leading-2.5 text-deepBlack">
                <h3 className="text-[9px] whitespace-nowrap">
                  Smart Matching{" "}
                </h3>
                <p className="mt-1 text-[11px] font-bold whitespace-nowrap">
                  Profile Set-up
                </p>
              </div>
            </div>

            <p className="font-bold text-deepBlack">92%</p>
          </div>
        </div>

        {/* Label */}
        <div className="text-2xl leading-4 absolute bottom-16 left-6 font-bold text-[#FFFFFF]">
          800+
          <div className="text-[9px] font-medium text-[#454545]">
            Smart Matches
          </div>
        </div>

        {/* Line Chart */}
        <div className="absolute right-0 bottom-0 w-full left-0 flex justify-end items-end h-full">
          <div className="h-[50%] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Tooltip content={() => null} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22272A"
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    stroke: "#22272A",
                    fill: "#22272A",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
