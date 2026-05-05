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
              <div className="sticky top-0 z-10 flex w-full max-w-[70%] mx-auto items-center justify-between overflow-hidden px-3 pt-4 pb-3 lg:px-0">
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

                <div className="flex justify-between pb-10 flex-1 w-full">
                  <ReferralSmartMatchChart />

                  <div className="flex">
                    <div className="drop-shadow-[0px_1px_2px_0px_#0000004D,0px_4px_7px_3px_#00000026]">
                      <div className="relative shrink-0 min-w-116.5 bg-white px-6.25 py-3.5 ticket-cutout h-57.25 no-scrollbar flex-1 rounded-3xl">
                        <div className="sticky top-0 z-2 flex items-center justify-between overflow-hidden border-b bg-white px-2 pt-1 pb-2">
                          <h2 className="text-[14px] leading-1 font-extrabold text-deepBlack">
                            Shortlisted
                          </h2>
                        </div>

                        {/* Cards Container */}
                        <div className="no-scrollbar flex flex-col overflow-y-auto">
                          {sliderData.slice(0, 2).map((person, idx) => (
                            <div key={person.id}>
                              <div className="flex items-center gap-3 py-3 px-2">
                                <div className="relative h-18 w-19 shrink-0 overflow-hidden rounded-l-2xl">
                                  <Image
                                    src={person.image}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex flex-1 flex-col gap-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0">
                                      <p className="truncate text-[13px] font-bold text-deepBlack leading-tight">
                                        {person.name}
                                      </p>
                                      <p className="truncate text-[11px] text-gray-400 leading-tight">
                                        {person.company || "—"}
                                      </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                      <span className="text-[13px] font-semibold text-deepBlack">
                                        {(
                                          (person.compatibility ?? 0) / 20
                                        ).toFixed(1)}
                                      </span>
                                      <svg
                                        className="h-4 w-4 fill-[#27E6A7]"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-2">
                                    <div>
                                      <p className="text-[10px] font-semibold text-[#27E6A7]">
                                        Title
                                      </p>
                                      <p className="truncate text-[11px] font-bold text-deepBlack">
                                        {person.role}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-semibold text-[#27E6A7]">
                                        Industry
                                      </p>
                                      <p className="truncate text-[11px] font-bold text-deepBlack">
                                        {person.industry || "—"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {idx < sliderData.slice(0, 5).length - 1 && (
                                <div className="h-px bg-gray-100 mx-2" />
                              )}
                            </div>
                          ))}
                          {sliderData.length === 0 && (
                            <div className="flex items-center justify-center py-4">
                              <p className="text-sm text-gray-500">
                                No recent connections yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full max-w-48 flex-col gap-y-2.5 bg-transparent px-2">
                      <MatchingHistoryChart />
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
