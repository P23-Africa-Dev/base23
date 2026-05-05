"use client";

export const dynamic = "force-dynamic";

import { MatchSidebar } from "@/components/referral/MatchSidebar";
import MatchingHistoryChart from "@/components/referral/profile-history-graph";
import ReferralSmartMatchChart from "@/components/referral/referral-smart-matches";
import SmartMatchTutorial from "@/components/referral/SmartMatchTutorial";
import images from "@/constants/image";

import ReferralCardSlider from "@/components/referral/desktop-smatch-slider";
import MobileReferralCardSlider from "@/components/referral/mobile-smatch-slider";
import ReferralSmatchProfile from "@/components/referral/referral-smatch-profile";
import AppLayout from "@/layouts/app-layout";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function Referrals() {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("smart_match_tutorial_seen");
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleMatchClose = () => {
    setIsMatchOpen(false);
    setActiveUser(null);
  };

  return (
    <AppLayout>
      <div className="relative border-0 bg-transparent pt-0 pb-2.5">
        {/* Zindex Background */}
        <div
          className={`absolute z-2 hidden h-full w-full lg:block ${bgLoaded ? "bg-[#031C5B] dark:lg:bg-gray-900" : "bg-white"} `}
        ></div>
        <div
          className="relative z-3 flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
          style={{
            backgroundImage: `url(${images.uibg})`,
          }}
        >
          <div
            className={`relative z-10 no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto lg:px-3 lg:pb-1`}
          >
            <div className="h-screen gap-5 overflow-hidden lg:pt-2 page-transition">
              {/*  Desktop and Mobile -  Header Search Bar */}
              <div className="mx-auto flex w-full items-center justify-center self-center bg-darkBlue px-4 py-3 lg:w-[85%] lg:bg-transparent lg:px-0">
                <div className="flex w-[170px] flex-col leading-4 text-white not-italic lg:w-[280px] lg:leading-5 lg:text-deepBlack lg:italic">
                  <h2 className="text-[10px] font-light lg:text-[20px]">
                    {" "}
                    Your Smart
                  </h2>
                  <h3 className="text-[14px] font-bold tracking-wide lg:text-[27px]">
                    {" "}
                    Matches
                  </h3>
                </div>

                <div className="flex w-full">
                  <div className="relative w-full cursor-pointer">
                    <input
                      type="text"
                      placeholder="Search by name, company, industry..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full rounded-full border-0 text-white pr-10 border-deepBlue bg-[#629FF04D] placeholder:text-[7px] px-4 py-2 text-xs text-deepBlack lg:placeholder:text-[10px] placeholder:font-light placeholder:text-white placeholder:italic focus:ring-0 focus:ring-primary/30 focus:outline-none lg:border lg:bg-transparent lg:px-4 lg:py-2 lg:pl-5 lg:text-base lg:placeholder:text-base lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                    />
                    <Image
                      src={images.desktopSearch}
                      className="absolute top-1/2 right-2 hidden h-6 w-6 -translate-y-1/2 lg:right-5 lg:block"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <Image
                      src={images.aiSearch}
                      className="absolute top-1/2 right-3 block h-4 w-4 -translate-y-1/2 lg:right-5 lg:hidden"
                      alt=""
                      width={16}
                      height={16}
                    />
                  </div>
                </div>
                <div className="flex w-28 items-end justify-end lg:w-60">
                  <div className="flex items-end justify-end">
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-transparent lg:h-12 lg:w-12 lg:bg-[#D6F955] transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <div className="relative hidden h-8 w-8 lg:block">
                        <img
                          src={images.refreshcolored}
                          className="absolute object-contain"
                          alt="Refresh matches"
                        />
                      </div>
                      <div className="relative h-6 w-6 lg:hidden">
                        <img
                          src={images.refreshNew}
                          className="absolute object-contain"
                          alt="Refresh matches"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/*  Desktop Layout (Smatch Match ) */}
              <div className="mx-auto mt-2 hidden w-[95%] lg:block animate-fadeIn">
                <div className="relative h-[416px]">
                  <div className="relative z-10 flex max-h-22 w-full justify-center">
                    <ReferralCardSlider
                      data={[]}
                      onMatch={() => {}}
                      showEmpty={true}
                    />
                  </div>
                  <div
                    style={{
                      backgroundImage: ` url(${images.referralbg})`,
                    }}
                    className="relative z-0 h-[300px] w-full rounded-4xl bg-[#193E47] bg-cover bg-center bg-repeat bg-blend-saturation shadow-[2px_5px_10px_-4px_rgba(0,0,0,0.4),-2px_3px_10px_-1px_rgba(0,0,0,0.4)]"
                  ></div>
                </div>

                <div className="-mt-3 ml-5 grid grid-cols-1 gap-x-0 pb-10 lg:grid-cols-[30%_46%_25%]">
                  <ReferralSmartMatchChart />

                  <div className="relative aspect-auto h-[27vh] overflow-hidden rounded-3xl bg-deepBlack bg-cover bg-center bg-no-repeat px-10 pt-4 pb-30 lg:bg-transparent lg:pb-20">
                    <img
                      src={images.dealBgCard}
                      alt={`lead card bg`}
                      className="absolute inset-0 hidden h-full w-full overflow-hidden rounded-3xl object-center lg:block"
                    />

                    <div className="relative no-scrollbar flex-1 overflow-y-auto pb-10">
                      {/* Search Header */}
                      <div className="sticky top-0 z-2 flex items-center justify-between overflow-hidden border-b-1 bg-white px-2 pt-1 pb-2">
                        <div className="">
                          <>
                            <h2 className="text-[14px] leading-1 font-extrabold text-deepBlack">
                              Recent Network
                            </h2>
                          </>
                        </div>
                      </div>

                      {/* Cards Container */}
                      <div className="flex h-[14vh] flex-col gap-2">
                        <div className="flex items-center justify-center py-4">
                          <p className="text-sm text-gray-500">
                            No recent connections yet
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-y-2.5 bg-transparent px-2">
                    {/* Matching History chart*/}
                    <MatchingHistoryChart />

                    {/* Profile setup */}
                    <div
                      onClick={() => setOpenProfile(true)}
                      className="relative flex h-[90px] w-full cursor-pointer flex-col rounded-2xl bg-[linear-gradient(90deg,#DF87B1_0%,#CD6BD0_49.4%,#BE51EA_92.79%)] p-2 shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex w-full justify-end">
                        <div className="flex h-[37px] w-[37px] items-center justify-center rounded-lg bg-[#F5F4F4] shadow-md">
                          <div className="relative h-5.5 w-5.5">
                            <img
                              src={images.margicband}
                              className="absolute object-contain"
                              alt=""
                            />
                          </div>
                        </div>
                      </div>

                      <div className="-mt-2 flex flex-col pl-6 leading-4.5 text-secondaryWhite italic">
                        <h4 className="text-[18px] font-extrabold">Set-up</h4>
                        <h4 className="text-[18px] font-extrabold">
                          New Profile
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile SAmtch Card Profile */}
              <div className="flex w-full flex-col items-center justify-center lg:hidden">
                <div className="mx-auto mt-4 flex w-[80%] flex-col items-center justify-center">
                  <MobileReferralCardSlider
                    data={[]}
                    onMatch={() => {}}
                    showEmpty={true}
                  />
                </div>

                {/* Buttons Actions */}
                <div className="mt-6">
                  <div className="flex gap-x-2.5">
                    <button
                      onClick={() => setOpenProfile(true)}
                      className="flex h-[46px] w-[46px] -translate-x-[50px] transform items-center justify-center rounded-full bg-[linear-gradient(83.85deg,#A47AF0_10.01%,#CCA6FF_88.82%)] shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)]"
                    >
                      <div className="relative h-5 w-5">
                        <img
                          src={images.adduser}
                          className="absolute object-contain"
                          alt=""
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <ReferralSmatchProfile
                open={openProfile}
                onClose={() => setOpenProfile(false)}
                onPreferencesSaved={() => {}}
              />

              {/* =================  Match SIDEBAR ================= */}
              <MatchSidebar
                open={isMatchOpen}
                user={activeUser}
                matchResult={null}
                onClose={handleMatchClose}
              />

              {/* =================  Smart Match Tutorial ================= */}
              <SmartMatchTutorial
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                onComplete={() => setShowTutorial(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
