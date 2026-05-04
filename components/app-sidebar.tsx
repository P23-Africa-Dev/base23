import images from "@/constants/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoPerson } from "react-icons/io5";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { SlSettings } from "react-icons/sl";
import axios from "axios";
import { useSidebar } from "./sidebar-context";
import { LogoutConfirmationModal } from "./ui/logout-confirmation-modal";
import NotificationCard from "./ui/notification-card";
import DealCardPopup from "./DealCardPopup";
import type { SmartMatchData } from "@/services/notification-service";
import SmartMatchService, {
  setCurrentUserId,
} from "@/services/smart-match-service";

// Type for received deal cards
type ReceivedDealCard = {
  id: number;
  deal_card_id: number;
  status: "pending" | "viewed" | "accepted" | "rejected";
  viewed_at: string | null;
  responded_at: string | null;
  created_at: string;
  deal_card: {
    id: number;
    title: string;
    deal_type: string;
    industry: string;
    description: string;
    timeline: string;
    geography: string;
    deal_value: string;
    tags: string[];
    created_at: string;
    sender: {
      id: number;
      name: string;
      avatar: string | null;
      job_title: string;
      company: string;
    } | null;
  };
};

type NavItem = { name: string; icon: string; href: string };
type MobileNavItem = {
  name: string;
  icon: string;
  activeIcon: string;
  href: string;
};
type ProfileNavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const PROFILE_SHOWCASE_ITEMS: ProfileNavItem[] = [
  {
    name: "Personal Profile",
    href: "/profile?tab=personal",
    icon: <IoPerson className="h-5 w-5" />,
  },
  {
    name: "Company Profile",
    href: "/profile?tab=company",
    icon: <HiOutlineUserGroup className="h-5 w-5" />,
  },
  {
    name: "Subscription",
    href: "/profile?tab=subscription",
    icon: <MdOutlineWorkspacePremium className="h-5 w-5" />,
  },
  {
    name: "Settings",
    href: "/profile?tab=settings",
    icon: <SlSettings className="h-5 w-5" />,
  },
];

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", icon: images.dashboardIcon, href: "/dashboard" },
  { name: "Match", icon: images.repeatIcon, href: "/referrals" },
  { name: "Messages", icon: images.bubbleChat1, href: "/message" },
];
const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    name: "Dashboard",
    icon: images.dashboardIcon,
    activeIcon: images.activeDashboard,
    href: "/dashboard",
  },
  {
    name: "Messages",
    icon: images.bubbleChat,
    activeIcon: images.activeChat,
    href: "/message",
  },
  {
    name: "Referrals",
    icon: images.repeatmobileIcon,
    activeIcon: images.activeRepeat,
    href: "/referrals",
  },
  {
    name: "Directory",
    icon: images.searchList,
    activeIcon: images.activeSearch,
    href: "/directory",
  },
  {
    name: "Leads",
    icon: images.shareKnowledgemobile,
    activeIcon: images.activeShare,
    href: "/leads",
  },
];

const userAccountItems: NavItem[] = [
  // { name: 'Admin Activities', icon: `${images.accountSettingsIcon}`, href: '/admin/activities' },
  {
    name: "Notifications",
    icon: `${images.notificationSidebarIcon}`,
    href: "#notifications",
  },
  { name: "Help", icon: `${images.profileIcon}`, href: "/help" },
];

export const AppSidebar: React.FC = () => {
  const { user: authUser } = useAuth();
  if (!authUser) return null;
  const auth = { user: authUser };
  const { open, setOpen } = useSidebar();
  const [activePath, setActivePath] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState<number>(0);
  const [totalUnreadNotifications, setTotalUnreadNotifications] =
    useState<number>(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Deal card modal state (for sent deal cards from notifications)
  const [showDealCardModal, setShowDealCardModal] = useState(false);
  const [selectedDealCardForModal, setSelectedDealCardForModal] =
    useState<any>(null);

  // Deal card popup state (for received deal cards from notifications)
  const [showDealCardPopup, setShowDealCardPopup] = useState(false);
  const [singleDealCardForPopup, setSingleDealCardForPopup] =
    useState<any>(null);
  const [singleDealCardStatus, setSingleDealCardStatus] = useState<
    "pending" | "viewed" | "accepted" | "rejected"
  >("pending");

  // Received deal cards state (for floating popup across all pages)
  const [receivedDealCards, setReceivedDealCards] = useState<
    ReceivedDealCard[]
  >([]);

  const profileRef = useRef<HTMLDivElement>(null);

  const { pathname } = window.location;

  const isLeadsPage = pathname === "/leads";

  // 👉 Detect outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
        setOpen(false);
      }
    }

    if (profileOpen) {
      setOpen(true); // ✅ Force sidebar open while profile is shown
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const profileImage: string = `${images.man6}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);
    }
  }, []); // run on mount

  // derive active item name from path
  const activeName = useMemo(() => {
    const match = NAV_ITEMS.find((n) => activePath.startsWith(n.href));
    return match?.name ?? "Dashboard";
  }, [activePath]);

  useEffect(() => {
    setOpen(true);
  }, [setOpen]);

  // Add this function to clean the URL
  const getProfilePicture = () => {
    if (!auth.user?.profile_picture) return profileImage;
    return auth.user.profile_picture.startsWith("http")
      ? auth.user.profile_picture
      : `${window.location.origin}${auth.user.profile_picture}`;
  };

  useEffect(() => {
    console.log("Profile picture URL:", auth.user.profile_picture);
  }, [auth.user.profile_picture]);

  // Add logout handler functions
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    axios.post("/logout").then(() => {
      window.location.href = "/login";
    });
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Handle sent deal card notification click - opens full info modal
  const handleSentDealCardClick = (dealCardData: any) => {
    if (dealCardData) {
      setSelectedDealCardForModal(dealCardData);
      setShowDealCardModal(true);
    }
  };

  // Handle received deal card notification click - opens popup
  const handleReceivedDealCardClick = (
    dealCardData: any,
    status: "pending" | "viewed" | "accepted" | "rejected",
  ) => {
    if (dealCardData) {
      setSingleDealCardForPopup(dealCardData);
      setSingleDealCardStatus(status);
      setShowDealCardPopup(true);
    }
  };

  // Close deal card popup
  const handleCloseDealCardPopup = () => {
    setShowDealCardPopup(false);
    setSingleDealCardForPopup(null);
  };

  // Handle smart match accept - creates conversation and navigates to messages
  const handleSmartMatchAccept = async (data: SmartMatchData) => {
    try {
      // Set user ID for API calls
      setCurrentUserId(auth.user.id);

      // First, call Python API to create conversation and send template message
      const response = await SmartMatchService.acceptSmartMatch({
        sender_id: data.sender_id,
        recipient_needs: data.recipient_needs || undefined,
      });

      if (response.success && response.conversation_id) {
        // Deduct 2 smart matching coins from the sender (User B)
        try {
          await axios.post("/api/coins/deduct-smart-match", {
            sender_id: data.sender_id,
          });
        } catch (coinError) {
          console.warn("Failed to deduct smart match coins:", coinError);
        }

        // Navigate to Laravel's message start endpoint which handles encrypted_id
        // This will find the existing conversation and redirect to it
        axios
          .post("/messages/start", {
            other_user_id: data.sender_id,
            redirect_to: "message/single",
          })
          .then((res) => {
            window.location.href = res.data.redirect ?? "/message";
          });
      } else {
        console.error("Failed to accept smart match:", response.message);
        // Fallback: try to start conversation via Laravel directly
        axios
          .post("/messages/start", {
            other_user_id: data.sender_id,
            redirect_to: "message/single",
          })
          .then((res) => {
            window.location.href = res.data.redirect ?? "/message";
          });
      }
    } catch (error) {
      console.error("Error accepting smart match:", error);
      // Fallback: navigate to messages page via Laravel
      axios
        .post("/messages/start", {
          other_user_id: data.sender_id,
          redirect_to: "message/single",
        })
        .then((res) => {
          window.location.href = res.data.redirect ?? "/message";
        });
    }
  };

  // Handle smart match decline - just close the popup
  const handleSmartMatchDecline = (data: SmartMatchData) => {
    console.log("Smart match declined for sender:", data.sender_name);
    // Could add API call here to track declined matches if needed
  };

  // Fetch received deal cards
  useEffect(() => {
    const fetchDealCards = async () => {
      try {
        const response = await axios.get("/api/dealcards/received");
        if (response.data.success) {
          setReceivedDealCards(response.data.deal_cards || []);
        }
      } catch (error) {
        console.warn("Failed to fetch received deal cards:", error);
      }
    };

    fetchDealCards();
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/unread-messages-count", {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTotalUnreadMessages(data.count || 0);
        }
      } catch (error) {
        console.warn("Failed to fetch unread messages count:", error);
      }
    };

    fetchUnreadCount();

    // Update count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadNotificationsCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTotalUnreadNotifications(data.count || 0);
        }
      } catch (error) {
        console.warn("Failed to fetch unread notifications count:", error);
      }
    };

    fetchUnreadNotificationsCount();

    // Update count every 30 seconds
    const notificationInterval = setInterval(
      fetchUnreadNotificationsCount,
      30000,
    );
    return () => clearInterval(notificationInterval);
  }, []);

  return (
    <div className="">
      {/* Desktop Navigation */}
      <aside
        className={`sticky top-0 left-0 z-[2] no-scrollbar hidden h-screen w-56 overflow-x-hidden overflow-y-auto outline-none select-none lg:block ${
          isLeadsPage
            ? "bg-[linear-gradient(180deg,#4D95AF_0%,#215568_100%)]"
            : "bg-gradient-to-b from-[#031C5B] via-[#0B1727] to-[#031C5B] text-white"
        }`}
        aria-expanded={true}
      >
        <div className="flex h-full flex-col justify-between">
          {/* Logo */}
          <div className="px-5 pt-14">
            <img
              src={images.fulllogo}
              alt="full logo"
              className="h-auto w-[110px]"
            />
          </div>

          {/* NAV */}
          <nav className="px-5">
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeName === item.name;
                return (
                  <li key={item.name} className="relative">
                    <Link
                      href={item.href}
                      onClick={() => setActivePath(item.href)}
                      className={`relative z-[1] flex cursor-pointer items-center transition-all duration-300 ${
                        isActive
                          ? "font-bold"
                          : "text-gray-400 hover:text-white"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Highlight background */}
                      <div
                        className={`absolute top-0 left-0 z-0 h-full w-[250px] transform bg-cover bg-center bg-no-repeat transition-all duration-300 ${
                          isActive
                            ? `active-link-bg -translate-x-3 rounded-l-full`
                            : ""
                        }`}
                      ></div>

                      {/* For close sidebar  */}
                      {isActive && isLeadsPage ? (
                        <img
                          src={images.leadstopActiveBg}
                          alt="active pattern"
                          className={`absolute z-[2] w-full opacity-85 transition-all duration-300 ${open ? "-top-[71px] left-[1680px] -z-[5] h-20" : "-top-[43px] left-10 z-0 h-[50px] w-full delay-300"} `}
                        />
                      ) : (
                        isActive && (
                          <img
                            src={images.TopactivesmallBG}
                            alt="active pattern"
                            className={`absolute z-[2] w-full transition-all duration-300 ${open ? "-top-[71px] left-[1680px] -z-[5] h-20" : "-top-10 left-10 z-0 h-[50px] w-full delay-300"} `}
                          />
                        )
                      )}
                      {isActive && isLeadsPage ? (
                        <img
                          src={images.leadsbottomActiveBg}
                          alt="active pattern"
                          className={`absolute z-[2] w-full transition-all duration-300 ${open ? "top-[71px] left-[1680px] -z-[5] h-20" : "-bottom-[41px] left-[60px] z-0 h-[50px] w-full delay-300"} `}
                        />
                      ) : (
                        isActive && (
                          <img
                            src={images.BottomactivesmallBG}
                            alt="active pattern"
                            className={`absolute z-[2] w-full transition-all duration-300 ${open ? "top-[71px] left-[1680px] -z-[5] h-20" : "-bottom-[44px] left-[40px] z-0 h-[50px] w-full delay-300"} `}
                          />
                        )
                      )}

                      {/* For Open  sidebar  */}
                      {isActive && isLeadsPage ? (
                        <img
                          src={images.leadstopActiveBg}
                          alt="active pattern"
                          className="absolute -top-[69px] left-[184px] h-20 w-auto transform"
                        />
                      ) : (
                        isActive && (
                          <img
                            src={images.topActiveBg}
                            alt="active pattern"
                            className="absolute -top-[71px] left-[160px] h-20 w-auto transform"
                          />
                        )
                      )}
                      {isActive && isLeadsPage ? (
                        <img
                          src={images.leadsbottomActiveBg}
                          alt="active pattern"
                          className="absolute -bottom-[65px] left-[172px] h-20 w-auto transform"
                        />
                      ) : (
                        isActive && (
                          <img
                            src={images.BottomActiveBg}
                            alt="active pattern"
                            className="absolute -bottom-[70px] left-[172px] h-20 w-auto transform"
                          />
                        )
                      )}

                      {/* Icon + Label */}
                      <div
                        className={`relative flex w-full items-center rounded-lg py-2 transition-colors duration-300 ${
                          isActive
                            ? "py-2.5 font-bold text-deepBlack hover:text-deepBlack/80"
                            : "font-light text-white hover:text-white/80"
                        }`}
                      >
                        <div
                          className={`mr-3 flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-full ${
                            isLeadsPage
                              ? isActive
                                ? "bg-[#1F4857] text-white"
                                : "bg-[#5E9AB0]"
                              : isActive
                                ? "bg-[#0B1727] text-center text-white"
                                : "bg-[#263D5C8F]"
                          }`}
                        >
                          <img
                            src={item.icon}
                            alt=""
                            className="h-6 w-6 object-contain"
                          />
                          {/* Notification badge for Messages */}
                          {item.name === "Messages" &&
                            totalUnreadMessages > 0 && (
                              <div className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {totalUnreadMessages > 99
                                  ? "99+"
                                  : totalUnreadMessages}
                              </div>
                            )}
                        </div>

                        <span className="ml-1.5 overflow-hidden whitespace-nowrap">
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Account Section */}
          <div className="relative px-5">
            <p
              className={`mb-4 text-xs font-light tracking-wider opacity-60 ${isLeadsPage ? "text-secondaryWhite" : "text-gray-400"}`}
            >
              USER ACCOUNT
            </p>

            {/* User Profile Trigger */}
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="mb-4 flex cursor-pointer items-center space-x-2"
            >
              <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-transparent">
                <img
                  src={getProfilePicture()}
                  alt={`${auth.user.name}'s Profile`}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = profileImage;
                  }}
                />
              </div>

              <div className="overflow-hidden max-w-37.5">
                <h3
                  className={`truncate text-[12px] font-bold ${isLeadsPage ? "text-secondaryWhite" : ""} `}
                >
                  {auth.user.name}
                </h3>
                <p className="truncate text-[11px] font-light text-white/75">
                  {auth.user.position && auth.user.company_name
                    ? `${auth.user.position} at ${auth.user.company_name}`
                    : auth.user.position || auth.user.company_name || ""}
                </p>
              </div>
            </div>

            <div className="mb-5 space-y-1 pl-2">
              {userAccountItems.map((item: NavItem) =>
                item.name === "Notifications" ? (
                  <button
                    key={item.name}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="flex w-full items-center pb-2.5 font-light text-white transition-colors duration-200 hover:text-white/80"
                  >
                    <div className="relative flex items-center rounded-lg transition-colors duration-400">
                      <div className="relative">
                        <img src={item.icon} className="mr-5" alt="" />
                        {/* Unread notification badge */}
                        {totalUnreadNotifications > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {totalUnreadNotifications > 99
                              ? "99+"
                              : totalUnreadNotifications}
                          </div>
                        )}
                      </div>
                      <span className="ml-2 overflow-hidden text-[13px] whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center pb-2.5 font-light text-white transition-colors duration-200 hover:text-white/80"
                  >
                    <div className="relative flex items-center rounded-lg transition-colors duration-400">
                      <img src={item.icon} className="mr-5" alt="" />
                      <span className="ml-2 overflow-hidden text-[13px] whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* MObile Bottom Navigation */}
      {(() => {
        const { pathname, search } = window.location;

        const isLeadsPage = pathname === "/leads";

        // A. message/single → hide ONLY when query params exist
        const hideForMessageSingle =
          pathname === "/message/single" && search.length > 0;

        // B. referrals/single → ALWAYS hide
        const hideForReferralSingle = pathname === "/referrals/single";

        const hideBottomNav = hideForMessageSingle || hideForReferralSingle;

        if (hideBottomNav) return null;

        return (
          <div className="fixed bottom-0 z-20 w-full overflow-hidden bg-transparent lg:hidden">
            <div className="relative z-0 w-full">
              <div
                style={{
                  backgroundImage: `url(${isLeadsPage ? images.leadsmobilemenupattern : images.curveMobilePattern})`,
                }}
                className="aboslute top-0 left-0 z-20 h-[145px] overflow-hidden bg-cover bg-top bg-no-repeat sm:h-[200px] md:h-[260px]"
              >
                <div className="fixed bottom-4 w-full px-8 md:bottom-7 md:px-13">
                  <div className="flex items-center justify-between">
                    {MOBILE_NAV_ITEMS.map((item, index) => {
                      const isActive = activeName === item.name;
                      const isMiddle = index === 2;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setActivePath(item.href)}
                          className={`flex items-center justify-center rounded-full transition-all duration-300 ${isMiddle ? "-mt-10 h-18 w-18 border bg-white shadow-[inset_0_4px_6px_rgba(0,0,0,0.5)] md:-mt-24 md:h-26 md:w-26" : "h-12 w-12"} ${
                            isActive && isLeadsPage
                              ? "bg-[#978FED] shadow-[inset_0_4px_6px_rgba(0,0,0,0.3)] md:p-1.5"
                              : isActive
                                ? "bg-[#27E6A7] shadow-[inset_0_4px_6px_rgba(0,0,0,0.3)] md:p-1.5"
                                : ""
                          } `}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <img
                            src={isActive ? item.activeIcon : item.icon}
                            alt={item.name}
                            className={`object-contain transition-all ${isMiddle ? "h-10 w-10 md:h-16 md:w-16" : "h-7 w-7 md:h-14 md:w-14"} `}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Slide-in Profile Showcase */}
      <AnimatePresence>
        {profileOpen && (
          <motion.div
            ref={profileRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            // onClick={() => setProfileOpen(false)}
            className={`absolute bottom-3 left-60 z-[10] w-62 rounded-xl ${isLeadsPage ? "bg-[linear-gradient(180deg,#4D95AF_0%,#215568_100%)]" : "bg-deepBlack"} p-4 text-sm shadow-xl`}
          >
            <div
              className={`absolute top-[65%] left-[-8px] h-4 w-4 rotate-45  ${isLeadsPage ? "bg-[#215568]" : "bg-deepBlack"}`}
            ></div>
            <div className="flex items-center space-x-3 pb-2">
              <div className="relative h-10 w-10 rounded-full">
                <img
                  src={getProfilePicture()}
                  alt={`${auth.user.name}'s Profile`}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = profileImage;
                  }}
                />
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-white">
                  {auth.user.name}
                </h4>
                <p className="text-[11px] text-gray-300">
                  {auth.user.position || "Member"}
                </p>
              </div>
            </div>

            <ul className="mb-2 space-y-1 border-b border-secondaryWhite pb-2">
              {PROFILE_SHOWCASE_ITEMS.map((item) => {
                // Check if we're on profile page and extract tab from URL
                const urlParams = new URLSearchParams(window.location.search);
                const currentTab = urlParams.get("tab") || "personal";

                let isActive = false;
                if (activePath === "/profile") {
                  if (
                    item.name === "Personal Profile" &&
                    currentTab === "personal"
                  )
                    isActive = true;
                  if (
                    item.name === "Company Profile" &&
                    currentTab === "company"
                  )
                    isActive = true;
                  if (
                    item.name === "Subscription and Coins" &&
                    currentTab === "subscription"
                  )
                    isActive = true;
                  if (item.name === "Settings" && currentTab === "settings")
                    isActive = true;
                }

                return (
                  <li key={item.name} className="relative">
                    <Link
                      href={item.href}
                      onClick={() => setActivePath("/profile")}
                      className={`relative z-[1] flex cursor-pointer items-center rounded-xl transition-all duration-300 ${
                        isActive
                          ? "font-bold text-deepBlack"
                          : "text-white/80 hover:bg-secondaryWhite hover:text-[#0b1727]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* highlight background */}
                      {isActive && (
                        <div className="absolute top-0 left-0 z-0 h-full w-full rounded-lg bg-secondaryWhite"></div>
                      )}

                      {/* Icon + Label */}
                      <div
                        className={`relative flex w-full items-center rounded-lg px-2 py-2 font-bold transition-colors duration-300 ${
                          isActive
                            ? "text-deepBlack"
                            : "text-white hover:text-deepBlack"
                        }`}
                      >
                        <div
                          className={`mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                            !isActive && isLeadsPage
                              ? "bg-[#5E9AB0] text-white "
                              : isActive
                                ? "bg-deepBlack text-white"
                                : "bg-deepBlack text-white "
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span className="transition-colors duration-300">
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* LOGOUT */}
            <button
              onClick={handleLogoutClick}
              className="flex w-full items-center justify-start gap-2 rounded-xl bg-transparent text-secondaryWhite transition-colors duration-200 hover:bg-gray-700/50"
            >
              <span className="m-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-deepBlack text-secondaryWhite">
                <img src={images.logout} alt="" />
              </span>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* Notification Card */}
      <NotificationCard
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        sidebarOpen={open}
        onSentDealCardClick={handleSentDealCardClick}
        onReceivedDealCardClick={handleReceivedDealCardClick}
        onSmartMatchAccept={handleSmartMatchAccept}
        onSmartMatchDecline={handleSmartMatchDecline}
      />

      {/* Deal Card Popup for received deal cards from notifications */}
      {showDealCardPopup && singleDealCardForPopup && (
        <DealCardPopup
          dealCards={[]}
          onDealCardsUpdate={() => {}}
          singleCard={singleDealCardForPopup}
          singleCardStatus={singleDealCardStatus}
          onSingleCardClose={handleCloseDealCardPopup}
        />
      )}

      {/* Deal Card Modal for sent deal cards from notifications */}
      <AnimatePresence>
        {showDealCardModal && selectedDealCardForModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDealCardModal(false)}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <img
                        src={images.dealcrdfolder}
                        alt="Deal Card"
                        className="h-5 w-5"
                      />
                    </div>
                    <h2 className="font-montserrat text-lg font-semibold text-gray-900">
                      Deal Card Details
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowDealCardModal(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Recipient info */}
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className="h-14 w-14 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-primary/20"
                      style={{
                        backgroundImage: selectedDealCardForModal.recipient
                          ?.profile_picture
                          ? `url(${selectedDealCardForModal.recipient.profile_picture})`
                          : `url(${images.man6})`,
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-montserrat font-semibold text-gray-900">
                        Sent to:{" "}
                        {selectedDealCardForModal.recipient?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedDealCardForModal.recipient?.position}
                        {selectedDealCardForModal.recipient?.company_name &&
                          ` at ${selectedDealCardForModal.recipient.company_name}`}
                      </p>
                    </div>
                    {/* Status badge */}
                    {selectedDealCardForModal.status === "pending" && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        Pending
                      </span>
                    )}
                    {selectedDealCardForModal.status === "viewed" && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        Viewed
                      </span>
                    )}
                    {selectedDealCardForModal.status === "accepted" && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Accepted
                      </span>
                    )}
                    {selectedDealCardForModal.status === "rejected" && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Declined
                      </span>
                    )}
                  </div>

                  {/* Deal card details */}
                  <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-5">
                    <h3 className="mb-2 font-montserrat text-xl font-bold text-gray-900">
                      {selectedDealCardForModal.title}
                    </h3>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {selectedDealCardForModal.deal_type}
                      </span>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {selectedDealCardForModal.industry}
                      </span>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-gray-600">
                      {selectedDealCardForModal.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Timeline
                        </p>
                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                          {selectedDealCardForModal.timeline || "Flexible"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Value
                        </p>
                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                          {selectedDealCardForModal.deal_value || "Negotiable"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Geography
                        </p>
                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                          {selectedDealCardForModal.geography || "Global"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Created date */}
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Sent on{" "}
                    {new Date(
                      selectedDealCardForModal.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Deal Card Popup - Shows received deal cards across all pages */}
      <DealCardPopup
        dealCards={receivedDealCards}
        onDealCardsUpdate={setReceivedDealCards}
      />
    </div>
  );
};
