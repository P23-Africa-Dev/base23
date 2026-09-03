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
import { ReferralsSkeleton } from "@/components/skeletons/referrals-skeleton";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function Referrals() {
  const { matches, matchWithUser, isLoadingMatches } = useSmartMatch();

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

  if (isLoadingMatches && matches.length === 0) {
    return (
      <AppLayout>
        <div className="relative min-h-screen bg-white dark:bg-gray-900 py-6">
          <ReferralsSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative border-0 bg-white dark:bg-gray-900 pt-0 pb-2.5 h-full">
        {/* Zindex Background */}
        <div
          className="absolute z-2 hidden h-full w-full lg:block bg-white dark:lg:bg-gray-900"
        ></div>
        <div
          className="relative z-3 flex flex-1 bg-white dark:bg-gray-900 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
          style={{
            backgroundImage: `url(${images.uibg})`,
          }}
        >
          <div
            className={`relative z-10 no-scrollbar flex min-h-screen lg:min-h-0 lg:h-screen lg:max-h-[98vh] w-full flex-col gap-3 overflow-y-auto px-3 sm:px-4 lg:px-3 pb-24 sm:pb-20 lg:pb-2`}
          >
            <div className="flex flex-col gap-2.5 sm:gap-3.5 lg:gap-2.5 xl:gap-3.5 min-h-full h-auto lg:justify-between lg:pt-2 xl:pt-3 pb-2 page-transition">
              {/*  Header Search Bar */}
              <div className="sticky top-0 z-20 flex w-full max-w-[1155px] items-center justify-between gap-2 overflow-hidden px-1 pt-2 pb-1.5 sm:px-2 sm:pt-3 sm:pb-2 mx-auto lg:px-0 shrink-0">
                <div className="flex shrink-0 flex-col text-deepBlack dark:text-white italic xl:w-40">
                  <h2 className="text-[12px] leading-tight font-normal sm:text-[14px] md:text-[15px] lg:text-[16px] lg:leading-3">
                    Your smart
                  </h2>
                  <h3 className="text-base font-extrabold sm:text-xl lg:text-[23px] xl:text-[25px] leading-tight">
                    matches
                  </h3>
                </div>

                <div className="flex flex-1 items-center space-x-2 lg:mr-14 lg:items-start max-w-xl">
                  <div className="relative w-full cursor-pointer">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyPress}
                      disabled={isSearching}
                      className="w-full rounded-full border-0 bg-[#27E6A729] dark:bg-gray-800 px-4 text-sm py-2 sm:py-2.5 text-deepBlack dark:text-gray-100 placeholder:text-sm placeholder:text-deepBlue/70 dark:placeholder-gray-400 placeholder:italic focus:ring-2 focus:ring-[#27E6A7]/40 focus:outline-none disabled:opacity-50 lg:px-4 lg:py-2.5 xl:py-3 lg:pr-18 lg:pl-5 lg:placeholder:text-deepBlue"
                    />
                    <button
                      onClick={handleSearchIconClick}
                      disabled={isSearching || !searchQuery.trim()}
                      className="absolute top-1/2 right-4 -translate-y-1/2 disabled:cursor-not-allowed"
                    >
                      <Image
                        src={images.desktopSearch}
                        className="hidden h-6 w-6 lg:block"
                        alt="Search"
                        width={24}
                        height={24}
                      />
                      <Image
                        src={images.aiSearch}
                        className="h-6 w-6 lg:hidden"
                        alt="AI Search"
                        width={24}
                        height={24}
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

              {/* Mobile slider (< md) */}
              <div className="block md:hidden px-1 h-[410px] sm:h-[440px] max-h-[500px]">
                <ReferralCardSlider
                  data={sliderData}
                  onMatch={handleSliderMatch}
                />
              </div>

              {/* Tablet slider (md to lg) */}
              <div className="hidden md:block lg:hidden mx-auto w-full max-w-[800px] animate-fadeIn">
                <div className="relative h-[410px] sm:h-[430px] flex flex-col rounded-3xl overflow-hidden">
                  <div
                    style={{ backgroundImage: `url(${images.greenBg})` }}
                    className="absolute inset-x-0 top-[26%] -bottom-4 bg-cover bg-center bg-no-repeat z-0"
                  />
                  <div className="relative z-10 flex-1 min-h-0 w-full flex items-center px-4 pt-2 pb-3">
                    <ReferralCardSlider
                      data={sliderData}
                      onMatch={handleSliderMatch}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop slider + teal background (>= lg) — desktop only */}
              <div className="mx-auto hidden w-full max-w-[1155px] lg:block animate-fadeIn shrink-0">
                <div className="relative h-[clamp(340px,44vh,490px)] flex flex-col rounded-3xl overflow-hidden">
                  <div
                    style={{ backgroundImage: `url(${images.greenBg})` }}
                    className="absolute inset-x-0 top-[26%] -bottom-4 bg-cover bg-center bg-no-repeat z-0"
                  />
                  <div className="relative z-10 flex-1 min-h-0 w-full flex items-center px-4 xl:px-[24px] pt-1.5 xl:pt-2 pb-2 xl:pb-2.5">
                    <ReferralCardSlider
                      data={sliderData}
                      onMatch={handleSliderMatch}
                    />
                  </div>
                </div>
              </div>

              {/* Below-slider content — ALL screen sizes */}
              <div className="mx-auto w-full max-w-[1155px] px-1 sm:px-2 lg:px-0 mt-auto shrink-0">
                <div className="flex flex-col gap-3 lg:gap-3.5 lg:flex-row lg:justify-between items-stretch lg:items-end">

                  {/* Smart match chart */}
                  <div className="w-full lg:flex-1 min-w-0">
                    <ReferralSmartMatchChart />
                  </div>

                  {/* Right column: Shortlisted + History + Setup */}
                  <div className="flex flex-col gap-3 sm:gap-3.5 sm:flex-row lg:flex-row items-stretch min-w-0">

                    {/* Shortlisted */}
                    <div className="drop-shadow-[1px_1px_2px_0px_#000000,1px_4px_7px_3px_#00000026] flex-1 sm:flex-initial min-w-0">
                      <div className="relative w-full bg-white px-3 sm:px-5 py-2.5 xl:py-3 match-cutout h-36 sm:h-40 lg:h-40 xl:h-43 2xl:h-47.5 no-scrollbar rounded-3xl overflow-hidden min-w-0 sm:min-w-[300px] lg:min-w-[320px] xl:min-w-[370px] 2xl:min-w-116.5">
                        <div className="sticky top-0 z-2 flex items-center justify-between overflow-hidden border-b bg-white px-1 xl:px-2 pt-0.5 pb-1.5">
                          <h2 className="text-[13px] xl:text-[14px] leading-none font-extrabold text-deepBlack">
                            Shortlisted
                          </h2>
                        </div>

                        <div className="no-scrollbar flex flex-col overflow-y-auto">
                          {sliderData.slice(0, 2).map((person, idx) => (
                            <div key={person.id}>
                              <div className="flex items-center gap-2 xl:gap-3 py-1.5 xl:py-2 px-1 xl:px-2">
                                <div className="relative h-13 w-14 xl:h-15 xl:w-16 shrink-0 overflow-hidden rounded-l-2xl">
                                  <Image
                                    src={person.image}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex flex-1 flex-col gap-0.5 xl:gap-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0">
                                      <p className="truncate text-[12px] xl:text-[13px] font-bold text-deepBlack leading-tight">
                                        {person.name}
                                      </p>
                                      <p className="truncate text-[10px] xl:text-[11px] text-gray-400 leading-tight">
                                        {person.company || "—"}
                                      </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                      <span className="text-[12px] xl:text-[13px] font-semibold text-deepBlack">
                                        {((person.compatibility ?? 0) / 20).toFixed(1)}
                                      </span>
                                      <svg className="h-3.5 w-3.5 xl:h-4 xl:w-4 fill-[#27E6A7]" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-2">
                                    <div>
                                      <p className="text-[9px] xl:text-[10px] font-semibold text-[#27E6A7]">Title</p>
                                      <p className="truncate text-[10px] xl:text-[11px] font-bold text-deepBlack">{person.role}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] xl:text-[10px] font-semibold text-[#27E6A7]">Industry</p>
                                      <p className="truncate text-[10px] xl:text-[11px] font-bold text-deepBlack">{person.industry || "—"}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {idx < sliderData.slice(0, 2).length - 1 && (
                                <div className="h-px bg-gray-100 mx-1" />
                              )}
                            </div>
                          ))}
                          {sliderData.length === 0 && (
                            <div className="flex items-center justify-center py-4">
                              <p className="text-sm text-gray-500">No recent connections yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* History chart + Setup New Profile */}
                    <div className="flex flex-row gap-2.5 sm:gap-3 sm:w-42 lg:w-44 xl:w-48 sm:flex-col lg:flex-col sm:gap-y-2 lg:gap-y-2 lg:bg-transparent shrink-0">
                      <div className="flex-1 sm:flex-none lg:flex-none">
                        <MatchingHistoryChart />
                      </div>
                      <div
                        onClick={() => setOpenProfile(true)}
                        className="flex-1 sm:flex-none lg:flex-none relative flex min-h-18 sm:min-h-19 xl:min-h-21 py-2 sm:py-2.5 xl:py-3 px-3.5 sm:px-4 cursor-pointer flex-col justify-between rounded-2xl bg-[linear-gradient(90deg,#DF87B1_0%,#CD6BD0_49.4%,#BE51EA_92.79%)] shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)] transition-transform hover:scale-[1.02] active:scale-98"
                      >
                        <div className="flex w-full justify-end">
                          <div className="flex h-7 w-7 sm:h-7.5 sm:w-7.5 xl:h-8.5 xl:w-8.5 items-center justify-center rounded-lg bg-[#F5F4F4] shadow-md">
                            <div className="relative h-4 w-4 sm:h-4.5 sm:w-4.5 xl:h-5 xl:w-5">
                              <Image
                                src={images.margicband}
                                className="absolute object-contain"
                                alt=""
                                width={20}
                                height={20}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col leading-snug text-white italic">
                          <h4 className="text-[14px] sm:text-[16px] xl:text-[18px] leading-tight font-extrabold">Set-up</h4>
                          <h4 className="text-[14px] sm:text-[16px] xl:text-[18px] leading-tight font-extrabold">New Profile</h4>
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
