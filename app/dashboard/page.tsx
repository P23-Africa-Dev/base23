"use client";

export const dynamic = "force-dynamic";

import UserCard from "@/components/cards/UserCard";
import SplineAreaChart from "@/components/chart/BasicAreaChart";
import { FilterSidebar } from "@/components/sidebars/dashbord-filter";
import UserProfileSidebar from "@/components/sidebars/user-show-sidebar";
import images from "@/constants/image";
import toast from "react-hot-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ActivityChartCard from "@/components/chart/ActivityChartCard";
import OnboardingActivator from "@/components/OnboardingActivator";
import { useAuth } from "@/context/AuthContext";
import { Counter } from "@/hooks/useCounter";
import AppLayout from "@/layouts/app-layout";
import Image from "next/image";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  profile_picture?: string | null;
  company_name?: string;
  company_description?: string;
  industry?: string;
  categories?: string;
  great_at?: string;
  can_help_with?: string;
  rating?: number;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  phone?: string;
  linkedin?: string;
  country?: string;
  position?: string;
  years_of_operation?: string;
  number_of_employees?: string;
  selected_outcome?: string;
  goals?: string;
  similarity_score?: number;
  total_score?: number;
  match_reasons?: any;
};

function Dashboard() {
  const { user: authUser } = useAuth();
  const auth = { user: authUser };

  const [users] = useState<User[]>([]);
  const [connected] = useState<User[]>([]);
  const [pending] = useState<User[]>([]);
  const [recommendedLeads] = useState<User[]>([]);
  const [needsOnboarding] = useState(false);
  const [openStepModal, setOpenStepModal] = useState(false);

  const [activityChange] = useState<{
    change: number;
    isIncrease: boolean;
  }>({
    change: 0,
    isIncrease: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sortedUsers] = useState<User[]>([]);
  const [isLoadingSortedUsers] = useState(false);

  useEffect(() => {
    const subscriptionSuccess = localStorage.getItem("subscription_success");
    if (subscriptionSuccess === "true") {
      localStorage.removeItem("subscription_success");

      toast.success(
        "🎉 Welcome to NOEL! Your subscription is now active. Enjoy your 14-day free trial!",
        {
          duration: 6000,
          style: {
            background: "#024E44",
            color: "#fff",
            padding: "16px",
            borderRadius: "10px",
          },
          iconTheme: {
            primary: "#CFE96D",
            secondary: "#024E44",
          },
        },
      );
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatArrayData = (
    data: string | string[] | null | undefined,
  ): string => {
    if (!data) return "Not specified";

    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.join(", ");
        }
        return data;
      } catch {
        return data;
      }
    }

    // If it's an array, join with commas
    if (Array.isArray(data)) {
      return data.join(", ");
    }

    return "Not specified";
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not available";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatExperience = (
    years: string | number | null | undefined,
  ): string => {
    if (!years) return "Experience not specified";
    if (typeof years === "string") {
      if (years.toLowerCase().includes("year")) {
        return years;
      }
      const numYears = parseInt(years, 10);
      if (!isNaN(numYears)) {
        return numYears === 1 ? "1 year" : `${numYears} years`;
      }
      return years;
    }

    if (typeof years === "number") {
      return years === 1 ? "1 year" : `${years} years`;
    }

    return "Experience not specified";
  };

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
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearchIconClick = () => {
    handleSearch();
  };

  const [activeTab, setActiveTab] = useState<
    "connection" | "smart-match" | "active-lead"
  >("connection");

  // ONLOAD BG BLUE BACKGROUND

  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = images.uibg;
    img.onload = () => setBgLoaded(true);
  }, []);

  return (
    <AppLayout>
      <OnboardingActivator needsOnboarding={needsOnboarding} />

      <div className="main-dashboard relative border-0 bg-transparent pt-0 pb-2.5">
        <div
          className={`absolute z-2 hidden h-full w-full lg:block ${bgLoaded ? "bg-[#031C5B] dark:lg:bg-gray-900" : "bg-white"} `}
        ></div>
        <div
          className="relative z-3 flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
          style={{
            backgroundImage: `url(${images.uibg})`,
          }}
        >
          <div className="relative z-10 no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto px-2 pb-1 lg:py-0 lg:pr-9 lg:pl-7 xl:pr-17 xl:pl-12">
            {/* USER GREETINGS */}
            <div className="hidden w-full text-gray-900 lg:block dark:text-white animate-fadeInDown">
              {auth.user ? (
                <h3 className="text-[27px] font-semibold tracking-wide">
                  {getGreeting()}{" "}
                  <span className="font-bold tracking-tight">
                    {auth.user.name}
                  </span>{" "}
                </h3>
              ) : (
                <h3 className="text-[27px] font-medium">
                  Good Morning <span className="font-bold">Kwame</span>{" "}
                </h3>
              )}
            </div>
            {/*-------------------------//////////////////////----------------- FIRST ROW MOBILE----------------//////////////////////------------------------- */}
            <div className="relative mt-1.5 w-full bg-no-repeat px-2 pt-5 pb-4 lg:hidden animate-fadeIn">
              <Image
                src={images.mobileCardBG}
                alt="lead card bg"
                width={800}
                height={400}
                className="reduce-h absolute inset-0 top-0 z-1 h-auto w-full object-cover"
              />

              <div className="relative z-2 grid w-full grid-cols-2 place-content-between px-5 sm:px-12">
                <div className="mb-1 w-full place-self-center text-secondaryWhite dark:text-white">
                  {auth.user ? (
                    <>
                      <h3 className="text-[14px] font-semibold tracking-wide whitespace-nowrap">
                        Hello{" "}
                        <span className="font-bold tracking-tight">
                          {" "}
                          {auth.user.name}!
                        </span>{" "}
                        {/*   */}
                      </h3>
                      <h6 className="text-xs font-light">{getGreeting()} </h6>
                    </>
                  ) : (
                    <h3 className="text-[12px] font-medium">
                      Good Morning <span className="font-bold">Kwame</span>{" "}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-2 place-self-end">
                  <Image
                    src={images.notificationsnooze}
                    className="h-4.5 w-auto"
                    alt=""
                    width={18}
                    height={18}
                  />

                  <div className="relative h-12 w-12 rounded-full bg-transparent p-2">
                    <div
                      style={{
                        // backgroundImage: `url(${images.man6})`,
                        backgroundImage: `url(${auth.user?.profile_picture || images.man6})`,
                      }}
                      className="absolute inset-0 h-full w-full rounded-full bg-cover bg-top bg-no-repeat"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* FIRST ROW */}
            <div className="grid auto-rows-min gap-4 lg:grid-cols-3 stagger-children">
              {/* CHART CONTAINER */}
              <div className="grid-card-shadow relative hidden aspect-auto overflow-hidden rounded-2xl bg-linear-to-r from-[#A47AF0] to-[#A47AF0]/60 p-2 lg:block hover-lift">
                <SplineAreaChart userId={auth.user?.id} />
              </div>

              {/* CONNECTIONS CONTAINER */}
              <div className="grid-card-shadow relative hidden aspect-auto overflow-hidden rounded-2xl lg:block hover-lift">
                <div className="flex flex-col p-3 pl-3 xl:pl-6">
                  <div className="flex justify-between">
                    <h4 className="font-bold lg:text-sm xl:text-base dark:text-deepBlue">
                      Matching Status
                    </h4>
                    <div>
                      <h5 className="flex items-center justify-end gap-1">
                        <span
                          className={`text-xl leading-10 font-medium lg:text-sm xl:text-base ${
                            activityChange.isIncrease
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.abs(activityChange.change)}%
                        </span>
                        <span>
                          <Image
                            className="h-6 w-6"
                            src={
                              activityChange.isIncrease
                                ? images.arrowUp
                                : images.arrowDown
                            }
                            alt={
                              activityChange.isIncrease
                                ? "Increase"
                                : "Decrease"
                            }
                            width={24}
                            height={24}
                          />
                        </span>
                      </h5>
                      <h6 className="-mt-2 text-[12px] font-normal">
                        {activityChange.isIncrease ? "Increase" : "Decrease"}{" "}
                        this week
                      </h6>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="-mt-4 items-center">
                      <div className="font-bold text-[#0496FF] lg:text-lg xl:text-3xl">
                        75,000
                      </div>
                      <h6 className="text-[#727677] lg:text-sm">
                        Available Matches
                      </h6>
                    </div>

                    <div className="mt-2">
                      <button
                        onClick={() => setOpenStepModal(true)}
                        className="flex h-8.25 w-8.25 items-center justify-center rounded-sm bg-[#4C6FFF]"
                      >
                        <div className="relative h-6 w-6.25">
                          <Image
                            src={images.filedownload}
                            fill
                            className="object-center"
                            alt=""
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/*-------------------------//////////////////////----------------- SECOND ROW MOBILE----------------//////////////////////------------------------- */}
              {/* MOBILE NETWORK STATUS */}
              <div className="flex justify-between lg:hidden animate-fadeInUp animate-delay-100">
                <div className="w-full max-w-72.5 md:max-w-87.5">
                  <h5 className="mb-1.5 pl-6 text-[10px] font-semibold tracking-wide md:text-base">
                    Network Stats
                  </h5>

                  <div className="flex rounded-full border-2 border-primary/70 px-4 py-2 pb-2.5 ">
                    {/* Leads */}
                    <div className="grid grid-cols-2 place-items-center gap-2">
                      <Image
                        src={images.shareKnowledge}
                        className="md::w-8 h-6 w-6 md:w-8"
                        alt=""
                        width={24}
                        height={24}
                      />

                      <div className="leading-4">
                        <span className="text-[17px] font-bold text-[#F05831] md:text-2xl">
                          {" "}
                          <Counter end={45000} />
                        </span>{" "}
                        <h6 className="text-[10px] text-[#727677] md:text-base">
                          Leads
                        </h6>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 place-items-center">
                      <Image
                        onClick={() => setOpenStepModal(true)}
                        src={images.unlink}
                        alt=""
                        className="md::w-8 h-6 w-6 md:w-8 -mr-4 md:-mr-10"
                        width={24}
                        height={24}
                      />

                      <div className="leading-4">
                        <span className="text-[17px]  font-bold text-[#0496FF] md:text-2xl">
                          {/* <Counter end={75000} /> */}
                          <Counter end={connected?.length || 0} />
                        </span>{" "}
                        <br />
                        <h6 className="text-[10px] text-[#727677] md:text-base">
                          Connections
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-items-end gap-1">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex">
                      <div
                        className="relative flex h-4 w-4 rounded-full bg-cover bg-top md:h-10 md:w-10"
                        style={{
                          backgroundImage: `url(${images.man3})`,
                        }}
                      ></div>
                      <div
                        className="relative flex h-4 w-4 rounded-full bg-cover bg-top md:h-10 md:w-10"
                        style={{
                          backgroundImage: `url(${images.man1})`,
                        }}
                      ></div>
                      <div
                        className="relative flex h-4 w-4 rounded-full bg-cover bg-top md:h-10 md:w-10"
                        style={{
                          backgroundImage: `url(${images.man2})`,
                        }}
                      ></div>
                    </div>
                    <h4 className="mb-1.5 w-full flex-1 text-center text-[8px] whitespace-nowrap text-primary">
                      200k+ People
                    </h4>
                    <button className="rounded-full bg-[#BB98FB] shadow-[1px_3px_4px_-1px_rgba(0,0,0,0.1),-2px_3px_4px_-1px_rgba(0,0,0,0.1)] px-3 py-1.5 text-[8.5px] font-semibold whitespace-nowrap">
                      Active Member
                    </button>
                  </div>
                </div>
              </div>

              {/*-------------------------//////////////////////----------------- THIRD ROW MOBILE----------------//////////////////////------------------------- */}
              <div className="lg:hidden animate-fadeInUp animate-delay-200">
                {/* <BasicColumnChart /> */}

                <ActivityChartCard />
              </div>

              {/*-------------------------//////////////////////----------------- FOURTH ROW LET'S FIND YOUR NEXT DEAL MOBILE ----------------//////////////////////------------------------- */}
              <div className="block lg:hidden animate-fadeInUp animate-delay-300">
                {/* Tabs Section */}

                <Tabs
                  defaultValue="connection"
                  onValueChange={(val) => setActiveTab(val as typeof activeTab)}
                >
                  <TabsList className="grid grid-cols-3 place-items-center rounded-full border border-[#F9F9F9] bg-[#F1EEEE] py-0 shadow-md">
                    <TabsTrigger
                      value="connection"
                      className="rounded-full bg-transparent px-3 py-2 text-[10px] font-normal whitespace-nowrap text-primary data-[state=active]:font-medium  data-[state=active]:bg-[#A87EF7]"
                    >
                      Directory ({users.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="smart-match"
                      className="rounded-full bg-transparent px-3 py-2 text-[10px] font-normal whitespace-nowrap text-primary data-[state=active]:font-medium  data-[state=active]:bg-[#A87EF7]"
                    >
                      Smart matches ({sortedUsers.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="active-lead"
                      className="rounded-full bg-transparent px-3 py-2 text-[10px] font-normal whitespace-nowrap text-primary data-[state=active]:font-medium  data-[state=active]:bg-[#A87EF7]"
                    >
                      Active leads ({recommendedLeads.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="relative mt-5 overflow-hidden rounded-3xl bg-deepBlack px-3 pb-3 pt-1.5">
                    <div className="relative no-scrollbar overflow-y-auto bg-transparent pb-10 lg:px-2">
                      <div className="sticky top-0 z-10 flex w-full items-center justify-between overflow-hidden rounded-3xl border-b-0 bg-deepBlack px-3 pt-4 pb-3">
                        <div className="flex w-[27%] flex-col text-white italic xl:w-40">
                          <h2 className="text-[11px] leading-2 font-normal sm:text-[14px] md:text-[15px]">
                            {" "}
                            Let&apos;s find your
                          </h2>
                          <h3 className="text-[12px] font-extrabold sm:text-xl">
                            {" "}
                            next deal
                          </h3>
                        </div>

                        <div className="flex w-[57%] items-center space-x-2">
                          <div className="relative w-full cursor-pointer">
                            <input
                              type="text"
                              placeholder="Search "
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={handleSearchKeyPress}
                              disabled={isSearching}
                              className="w-full rounded-full border-0 bg-gray-700 text-[11px] lg:text-sm pr-12 px-4 py-1.5 pt-2 lg:pt-0 lg:py-2 text-white lg:text-deepBlack placeholder:text-[10px] lg:placeholder:text-sm placeholder:text-white placeholder:italic focus:ring-0 focus:ring-primary/30 focus:outline-none disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                            />
                            <button
                              onClick={handleSearchIconClick}
                              disabled={isSearching || !searchQuery.trim()}
                              className="absolute top-1/2 right-5 -translate-y-1/2 disabled:cursor-not-allowed"
                            >
                              <Image
                                src={images.desktopSearch}
                                className="hidden h-6 w-6"
                                alt="Search"
                                width={24}
                                height={24}
                              />
                              <Image
                                src={images.aiSearch}
                                className="h-4.5 w-4.5"
                                alt="AI Search"
                                width={18}
                                height={18}
                              />
                            </button>
                            {isSearching && (
                              <div className="absolute top-1/2 right-12 -translate-y-1/2">
                                <div className="h-2 w-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* FILTER SIDEBAR INTEGRATION FOR SEARCH */}
                        <FilterSidebar variant="dashboard" />
                      </div>

                      {/* Tab Contents */}
                      <TabsContent value="connection" className="mt-0">
                        <div className="no-scrollbar h-[45vh] pb-10 divide-y divide-white/30 overflow-y-auto">
                          {users.length > 0 ? (
                            users
                              .filter(
                                (user) => auth.user && user.id !== auth.user.id,
                              )
                              .slice(0, 20) // Limit to first 20 for mobile performance
                              .map((user) => (
                                <UserProfileSidebar
                                  variant="all"
                                  userId={user.id}
                                  authUserId={auth.user?.id ?? 0}
                                  key={user.id}
                                  name={user.name}
                                  title={
                                    user.position || "Position not specified"
                                  }
                                  imageSrc={user.profile_picture || ""}
                                  experience={formatExperience(
                                    user.years_of_operation,
                                  )}
                                  industry={
                                    user.industry || "Industry not specified"
                                  }
                                  interest={formatArrayData(user.categories)}
                                  reviews={
                                    user.rating
                                      ? `${user.rating}/5`
                                      : "No rating"
                                  }
                                  baseLocation={
                                    user.country || "Location not specified"
                                  }
                                  operatesIn={
                                    user.country || "Location not specified"
                                  }
                                  bio={
                                    user.company_description ||
                                    "No bio available"
                                  }
                                  companyStage={
                                    user.selected_outcome ||
                                    "Stage not specified"
                                  }
                                  keyStrength={formatArrayData(user.great_at)}
                                  topGoal={user.goals || "Goals not specified"}
                                  brnMemberSince={formatDate(user.created_at)}
                                  responseRate={"N/A"}
                                  successfulDealsRate={"N/A"}
                                  connected={connected}
                                  pending={pending}
                                >
                                  <UserCard
                                    name={user.name}
                                    location={
                                      user.country || "Location not specified"
                                    }
                                    title={
                                      user.position || "Position not specified"
                                    }
                                    industry={user.industry || "N/A"}
                                    rating={user.rating || 0}
                                    imageSrc={user.profile_picture || ""}
                                  />
                                </UserProfileSidebar>
                              ))
                          ) : (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center text-white">
                                <p className="text-xs font-medium">
                                  No users found
                                </p>
                                <p className="text-[10px] text-gray-300">
                                  Check back later for new connections
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="smart-match" className="mt-0">
                        <div className="no-scrollbar h-[45vh] pb-10 divide-y divide-white/30 overflow-y-auto">
                          {isLoadingSortedUsers ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center text-white">
                                <div className="mx-auto mb-2 text-xs h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <p>Loading smart matches...</p>
                              </div>
                            </div>
                          ) : sortedUsers.length > 0 ? (
                            sortedUsers.slice(0, 15).map((user) => (
                              <UserProfileSidebar
                                variant="all"
                                userId={user.id}
                                authUserId={auth.user?.id ?? 0}
                                key={user.id}
                                name={user.name}
                                title={
                                  user.position || "Position not specified"
                                }
                                imageSrc={user.profile_picture || ""}
                                experience={formatExperience(
                                  user.years_of_operation,
                                )}
                                industry={
                                  user.industry || "Industry not specified"
                                }
                                interest={formatArrayData(user.categories)}
                                reviews={
                                  user.rating ? `${user.rating}/5` : "No rating"
                                }
                                baseLocation={
                                  user.country || "Location not specified"
                                }
                                operatesIn={
                                  user.country || "Location not specified"
                                }
                                bio={
                                  user.company_description || "No bio available"
                                }
                                companyStage={
                                  user.selected_outcome || "Stage not specified"
                                }
                                keyStrength={formatArrayData(user.great_at)}
                                topGoal={user.goals || "Goals not specified"}
                                brnMemberSince={formatDate(user.created_at)}
                                responseRate={"N/A"}
                                successfulDealsRate={"N/A"}
                                connected={connected}
                                pending={pending}
                              >
                                <UserCard
                                  name={user.name}
                                  location={
                                    user.country || "Location not specified"
                                  }
                                  title={
                                    user.position || "Position not specified"
                                  }
                                  industry={user.industry || "N/A"}
                                  rating={user.rating || 0}
                                  imageSrc={user.profile_picture || ""}
                                />
                              </UserProfileSidebar>
                            ))
                          ) : (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center text-white">
                                <p className="text-sm font-medium">
                                  No smart matches yet
                                </p>
                                <p className="text-xs text-gray-300">
                                  Complete your profile to get better matches
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="active-lead" className="mt-0">
                        <div className="no-scrollbar h-[45vh] pb-10 divide-y divide-white/30 overflow-y-auto">
                          {recommendedLeads.length > 0 ? (
                            recommendedLeads.slice(0, 15).map((user) => (
                              <UserProfileSidebar
                                variant="all"
                                userId={user.id}
                                authUserId={auth.user?.id ?? 0}
                                key={user.id}
                                name={user.name}
                                title={
                                  user.position || "Position not specified"
                                }
                                imageSrc={user.profile_picture || ""}
                                experience={formatExperience(
                                  user.years_of_operation,
                                )}
                                industry={
                                  user.industry || "Industry not specified"
                                }
                                interest={formatArrayData(user.categories)}
                                reviews={
                                  user.rating ? `${user.rating}/5` : "No rating"
                                }
                                baseLocation={
                                  user.country || "Location not specified"
                                }
                                operatesIn={
                                  user.country || "Location not specified"
                                }
                                bio={
                                  user.company_description || "No bio available"
                                }
                                companyStage={
                                  user.selected_outcome || "Stage not specified"
                                }
                                keyStrength={formatArrayData(user.great_at)}
                                topGoal={user.goals || "Goals not specified"}
                                brnMemberSince={formatDate(user.created_at)}
                                responseRate={"N/A"}
                                successfulDealsRate={"N/A"}
                                connected={connected}
                                pending={pending}
                              >
                                <UserCard
                                  name={user.name}
                                  location={
                                    user.country || "Location not specified"
                                  }
                                  title={
                                    user.position || "Position not specified"
                                  }
                                  industry={user.industry || "N/A"}
                                  rating={user.rating || 0}
                                  imageSrc={user.profile_picture || ""}
                                />
                              </UserProfileSidebar>
                            ))
                          ) : (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center text-white">
                                <p className="text-xs font-medium">
                                  No active leads
                                </p>
                                <p className="text-[10px] text-gray-300">
                                  Start connecting to generate leads
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </div>
                  </div>
                </Tabs>
              </div>

              {/*-------------------------//////////////////////----------------- FOURTH ROW MOBILE ENDED ----------------//////////////////////------------------------- */}

              {/* COMMUNITY CONTAINER */}
              <div className="grid-card-shadow relative hidden aspect-auto overflow-hidden rounded-2xl lg:block hover-lift">
                <div className="h-full w-full bg-linear-to-r from-[#12553F] to-[#02251A] pl-6">
                  <div className="flex w-full gap-3">
                    <div className="flex w-[40%] flex-col justify-end pt-8 pb-3">
                      <h4 className="leading-5 font-semibold text-white lg:text-[16px]">
                        Let&apos;s Join Our Community
                      </h4>

                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex">
                          <div
                            style={{
                              backgroundImage: `url(${images.man3})`,
                            }}
                            className="relative h-6 w-6 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat"
                          ></div>
                          <div
                            style={{
                              backgroundImage: `url(${images.man1})`,
                            }}
                            className="relative h-6 w-6 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat"
                          ></div>
                          <div
                            style={{
                              backgroundImage: `url(${images.man5})`,
                            }}
                            className="relative h-6 w-6 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat"
                          ></div>
                        </div>

                        <h4 className="ml-1 w-full flex-1 text-[9px] whitespace-nowrap text-white/70">
                          200k+ People
                        </h4>
                      </div>
                    </div>
                    <div className="relative w-[60%]">
                      <Image
                        className="absolute -bottom-3 w-full max-w-85"
                        src={images.flowerPattern}
                        alt=""
                        width={340}
                        height={200}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECOND ROW */}
            <div className="drop-shadow-[0px_4px_6px_rgba(0,0,0,0.3)]">
              <div className="ticket-cutout relative aspect-auto h-133.75 w-full bg-white bg-cover rounded-2xl">
                <div className="relative no-scrollbar flex-1 overflow-y-auto pb-10 lg:pb-0">
                  <div className="sticky top-0 z-10 flex w-full items-center justify-between overflow-hidden border-b-0 bg-deepBlack px-3 pt-4 pb-3 lg:border-b lg:bg-white lg:px-0">
                    <div className="flex w-full flex-col text-white italic lg:text-deepBlack xl:w-40">
                      <h2 className="text-[12px] leading-2 font-normal sm:text-[14px] md:text-[15px] lg:text-[17px] lg:leading-3">
                        Let&apos;s find your
                      </h2>
                      <h3 className="text-base font-extrabold sm:text-xl lg:text-[25px]">
                        next deal
                      </h3>
                    </div>

                    <div className="flex w-[57%] items-center space-x-2 lg:mr-14 lg:w-[60%] lg:items-start">
                      <div className="relative w-full cursor-pointer">
                        <input
                          type="text"
                          placeholder="Search "
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
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

                    {/* FILTER SIDEBAR INTEGRATION FOR SEARCH */}
                    <FilterSidebar variant="dashboard" />
                  </div>

                  {/* Cards USER LEADS Container */}
                  <div className="h-[40vh] divide-y divide-white/30">
                    {isLoadingSortedUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-white lg:text-deepBlack text-base">
                          Loading intelligently sorted users...
                        </div>
                      </div>
                    ) : (
                      sortedUsers.map((user) => (
                        <UserProfileSidebar
                          variant="all"
                          userId={user.id}
                          authUserId={auth.user?.id ?? 0}
                          key={user.id}
                          name={user.name}
                          title={user.position || "Position not specified"}
                          imageSrc={user.profile_picture || ""}
                          experience={user.years_of_operation || "N/A"}
                          industry={user.industry || "N/A"}
                          interest={formatArrayData(user.categories)}
                          reviews={user.rating ? user.rating.toString() : "0"}
                          baseLocation={user.country || "N/A"}
                          operatesIn={user.country || "N/A"}
                          bio={user.company_description || ""}
                          companyStage={user.selected_outcome || ""}
                          keyStrength={formatArrayData(user.great_at)}
                          topGoal={user.goals || ""}
                          brnMemberSince={formatDate(user.created_at)}
                          responseRate={"N/A"}
                          successfulDealsRate={"N/A"}
                          connected={connected}
                          pending={pending}
                        >
                          <UserCard
                            name={user.name}
                            location={user.country || "Location not specified"}
                            title={user.position || "Position not specified"}
                            industry={user.industry || "N/A"}
                            rating={user.rating || 0}
                            imageSrc={user.profile_picture || ""}
                          />
                        </UserProfileSidebar>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
