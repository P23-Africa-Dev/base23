"use client";

export const dynamic = "force-dynamic";

import { MatchSidebar } from "@/components/referral/MatchSidebar";
import { FilterSidebar } from "@/components/sidebars/dashbord-filter";
import MatchingHistoryChart from "@/components/referral/profile-history-graph";
import ReferralSmartMatchChart from "@/components/referral/referral-smart-matches";
import SmartMatchTutorial from "@/components/referral/SmartMatchTutorial";
import ReferralCardSlider, {
  type SliderConnection,
} from "@/components/referral/desktop-smatch-slider";
import MobileReferralCardSlider from "@/components/referral/mobile-smatch-slider";
import ReferralSmatchProfile from "@/components/referral/referral-smatch-profile";
import AppLayout from "@/layouts/app-layout";
import { DUMMY_SLIDER_CONNECTIONS } from "@/constants/dummy-data";
import useSmartMatch from "@/hooks/use-smart-match";
import SmartMatchService from "@/services/smart-match-service";
import images from "@/constants/image";
import toast from "react-hot-toast";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function Referrals() {
  const { matches, matchWithUser } = useSmartMatch();

  const sliderData: SliderConnection[] = useMemo(() => {
    if (matches && matches.length > 0) {
      return [...matches]
        .sort((a, b) => b.compatibility - a.compatibility)
        .map((match) => ({
          id: match.id,
          name: match.name,
          role: match.position || "Professional",
          company: match.company_name || "",
          image: match.profile_picture || images.man1,
          compatibility: match.compatibility,
          compatibility_breakdown: match.compatibility_breakdown,
          match_reasons: match.match_reasons,
          why_this_match: match.ai_insights,
          industry: match.industry,
          user_needs: match.user_needs,
          preferred_industry: match.preferred_industry,
          business_level: match.business_level,
          selected_tags: match.selected_tags,
        }));
    }
    return DUMMY_SLIDER_CONNECTIONS;
  }, [matches]);

  const handleSliderMatch = async (user: SliderConnection) => {
    try {
      const result = await matchWithUser(user.id);
      if (result) {
        await SmartMatchService.sendSmartMatch({
          recipient_id: user.id,
          compatibility: user.compatibility,
          match_reasons: user.match_reasons,
          why_this_match: user.why_this_match,
        });
        toast.success(`Match request sent to ${user.name}!`, {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#0B1727",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
          },
          icon: "🤝",
        });
      }
    } catch {
      toast.error("Failed to send match request. Please try again.", {
        duration: 3000,
      });
    }
  };

  const [bgLoaded, setBgLoaded] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      window.location.href = `/directory?search=${encodeURIComponent(searchQuery)}`;
    } catch (error) {
      console.error("Search navigation error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSearchIconClick = () => {
    handleSearch();
  };

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("smart_match_tutorial_seen");
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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
              <div className="sticky top-0 z-10 flex w-full max-w-[70%] mx-auto items-center justify-between overflow-hidden px-3 pt-4 pb-3 bg-white lg:px-0">
                <div className="flex w-full flex-col text-white italic lg:text-deepBlack xl:w-40">
                  <h2 className="text-[12px] leading-2 font-normal sm:text-[14px] md:text-[15px] lg:text-[17px] lg:leading-3">
                    Your smart
                  </h2>
                  <h3 className="text-base font-extrabold sm:text-xl lg:text-[25px]">
                    matches
                  </h3>
                </div>

                <div className="flex w-[57%] items-center space-x-2 lg:mr-14 lg:w-[60%] lg:items-start">
                  <div className="relative w-full cursor-pointer">
                    <input
                      type="text"
                      placeholder="Search "
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyPress}
                      disabled={isSearching}
                      className="w-full rounded-full border-0 bg-gray-700 px-4 text-sm py-2 text-deepBlack placeholder:text-sm placeholder:text-white placeholder:italic focus:ring-0 focus:ring-primary/30 focus:outline-none disabled:opacity-50 lg:bg-[#27E6A729] lg:px-4 lg:py-3 lg:pr-18 lg:pl-5 lg:placeholder:text-deepBlue dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                    />
                    <button
                      onClick={handleSearchIconClick}
                      disabled={isSearching || !searchQuery.trim()}
                      className="absolute top-1/2 right-5 -translate-y-1/2 disabled:cursor-not-allowed"
                    >
                      <Image
                        src={images.desktopSearch}
                        className="hidden h-6 w-6 lg:right-10 lg:block"
                        alt="Search"
                        width={24}
                        height={24}
                      />
                      <Image
                        src={images.aiSearch}
                        className="h-7 w-7 lg:right-10 lg:hidden"
                        alt="AI Search"
                        width={28}
                        height={28}
                      />
                    </button>
                    {isSearching && (
                      <div className="absolute top-1/2 right-12 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>

                <FilterSidebar variant="dashboard" />
              </div>

              {/*  Desktop Layout (Smatch Match ) */}
              <div className="mx-auto mt-2 hidden w-[95%] lg:block animate-fadeIn">
                <div className="relative h-[416px]">
                  <div className="relative z-10 flex max-h-22 w-full justify-center px-[30px]">
                    <ReferralCardSlider
                      data={sliderData}
                      onMatch={handleSliderMatch}
                    />
                  </div>
                  <div
                    style={{
                      backgroundImage: ` url(${images.referralbg})`,
                    }}
                    className="relative z-0 h-[300px] w-full rounded-4xl bg-[#193E47] bg-cover bg-center bg-repeat bg-blend-saturation shadow-[2px_5px_10px_-4px_rgba(0,0,0,0.4),-2px_3px_10px_-1px_rgba(0,0,0,0.4)]"
                  ></div>
                </div>

                <div className="-mt-3 ml-1 grid grid-cols-1 gap-x-0 pb-10 lg:grid-cols-[30%_46%_25%]">
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

                  <div className="flex w-full max-w-48 flex-col gap-y-2.5 bg-transparent px-2">
                    {/* Matching History chart*/}
                    <MatchingHistoryChart />

                    {/* Profile setup */}
                    <div
                      onClick={() => setOpenProfile(true)}
                      className="relative flex min-h-22.5 py-4.25 px-6.5 pl-5.25 w-full cursor-pointer flex-col rounded-2xl bg-[linear-gradient(90deg,#DF87B1_0%,#CD6BD0_49.4%,#BE51EA_92.79%)] shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex w-full justify-end">
                        <div className="flex h-9.25 w-9.25 items-center justify-center rounded-lg bg-[#F5F4F4] shadow-md">
                          <div className="relative h-5.5 w-5.5">
                            <Image
                              src={images.margicband}
                              className="absolute object-contain"
                              alt=""
                              width={22}
                              height={22}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col leading-4.5 text-secondaryWhite italic">
                        <h4 className="text-[20px] leading-6 font-extrabold">
                          Set-up
                        </h4>
                        <h4 className="text-[20px] leading-6 font-extrabold">
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
                    data={sliderData}
                    onMatch={handleSliderMatch}
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
