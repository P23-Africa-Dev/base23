import images from "@/constants/image";
import { useAuth } from "@/context/AuthContext";
import type { SmartMatchData } from "@/services/notification-service";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoPerson } from "react-icons/io5";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { SlSettings } from "react-icons/sl";
import DealCardPopup from "./DealCardPopup";
import { LogoutConfirmationModal } from "./ui/logout-confirmation-modal";
import NotificationCard from "./ui/notification-card";

const SIDEBAR_BG = "#0B1727";

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
  { name: "Directory", icon: images.directoryIcon, href: "/directory" },
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
  const pathname = usePathname() ?? "";
  const isLeadsPage = pathname === "/leads";
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setMobileProfileOpen(false);
  }, [pathname]);
  const totalUnreadMessages = 0;
  const totalUnreadNotifications = 0;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showDealCardModal, setShowDealCardModal] = useState(false);
  const [selectedDealCardForModal, setSelectedDealCardForModal] =
    useState<any>(null);

  const [showDealCardPopup, setShowDealCardPopup] = useState(false);
  const [singleDealCardForPopup, setSingleDealCardForPopup] =
    useState<any>(null);
  const [singleDealCardStatus, setSingleDealCardStatus] = useState<
    "pending" | "viewed" | "accepted" | "rejected"
  >("pending");

  const receivedDealCards: ReceivedDealCard[] = [];

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const profileImage: string = `${images.man6}`;

  const getProfilePicture = () => {
    return profileImage;
  };

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
  const handleSmartMatchAccept = (_data: SmartMatchData) => {
    window.location.href = "/message";
  };
  const handleSmartMatchDecline = (_data: SmartMatchData) => {};

  if (!authUser) return null;

  return (
    <div className="">
      {/* ─── Mobile Top Bar ──────────────────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#0B1727] px-5 lg:hidden">
        <span className="text-2xl font-extrabold tracking-tight text-[#F3F0E9]">
          BASE 23
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl bg-white/10 transition-colors hover:bg-white/20 active:scale-95"
        >
          <span className="h-0.5 w-5 rounded-full bg-[#F3F0E9]" />
          <span className="h-0.5 w-5 rounded-full bg-[#F3F0E9]" />
          <span className="h-0.5 w-3 self-end rounded-full bg-[#27E6A7]" />
        </button>
      </div>

      {/* ─── Mobile Backdrop ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ─── Mobile Drawer ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-linear-to-b from-[#031C5B] via-[#0B1727] to-[#031C5B] text-white lg:hidden"
          >
            {/* Teal accent edge */}
            <div className="absolute inset-y-0 left-0 w-1 bg-[#27E6A7]" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 pb-5 pt-8">
              <span className="text-3xl font-extrabold text-[#F3F0E9]">
                BASE 23
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#F3F0E9] transition-colors hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Profile Row */}
            <motion.button
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
              className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10"
            >
              <img
                src={getProfilePicture()}
                alt={authUser.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#27E6A7]/50"
                onError={(e) => { e.currentTarget.src = profileImage; }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#F3F0E9]">{authUser.name}</p>
                <p className="truncate text-[11px] text-white/60">
                  {authUser.position && authUser.company_name
                    ? `${authUser.position} at ${authUser.company_name}`
                    : authUser.position || authUser.company_name || "Member"}
                </p>
              </div>
              <motion.svg
                animate={{ rotate: mobileProfileOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            {/* Profile sub-items */}
            <AnimatePresence initial={false}>
              {mobileProfileOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white/5 px-2 py-1"
                >
                  {PROFILE_SHOWCASE_ITEMS.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
                          {item.icon}
                        </div>
                        <span className="text-[13px]">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <img src={images.logout} alt="" className="h-4 w-4" />
                      </div>
                      <span className="text-[13px]">Logout</span>
                    </button>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="mx-6 mb-4 h-px bg-white/10" />

            {/* Main Nav */}
            <nav className="flex-1 px-4">
              <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Navigation
              </p>
              <ul className="space-y-1">
                {NAV_ITEMS.map((item, index) => {
                  const active = isActive(item.href);
                  return (
                    <motion.li
                      key={item.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.06 }}
                    >
                      <Link
                        href={item.href}
                        className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                          active
                            ? "bg-[#F3F0E9] text-[#0B1727]"
                            : "text-white/70 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                            active ? "bg-[#0B1727]" : "bg-white/10 group-hover:bg-white/15"
                          }`}
                        >
                          <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
                        </div>
                        <span className="text-[15px] font-medium">{item.name}</span>
                        {active && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-[#27E6A7]" />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Divider */}
              <div className="my-4 h-px bg-white/10" />

              <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Account
              </p>
              <ul className="space-y-1">
                {userAccountItems.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.28 + index * 0.06 }}
                  >
                    {item.name === "Notifications" ? (
                      <button
                        onClick={() => { setShowNotifications(!showNotifications); setMobileOpen(false); }}
                        className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                      >
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/15">
                          <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
                          {totalUnreadNotifications > 0 && (
                            <div className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                              {totalUnreadNotifications > 99 ? "99+" : totalUnreadNotifications}
                            </div>
                          )}
                        </div>
                        <span className="text-[15px] font-medium">{item.name}</span>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/15">
                          <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
                        </div>
                        <span className="text-[15px] font-medium">{item.name}</span>
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Drawer Footer */}
            <div className="px-6 py-5">
              <p className="text-center text-[10px] text-white/20 tracking-widest uppercase">Business Referral Network</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
      <aside className="sticky top-0 left-0 z-2 no-scrollbar hidden h-screen w-56 overflow-x-hidden overflow-y-auto text-white outline-none select-none lg:block bg-linear-to-b from-[#031C5B] via-[#0B1727] to-[#031C5B]">
        <div className="flex h-full flex-col justify-between">
          <div className="px-5 pt-14 text-[36px] font-extrabold text-[#F3F0E9]">
            BASE 23
          </div>

          {/* NAV */}
          <nav className="mt-6 pl-5">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className="relative flex items-center"
                      aria-current={active ? "page" : undefined}
                    >
                      {active && (
                        <>
                          <span className="absolute inset-y-0 left-0 right-0 rounded-l-full bg-[#F9F9F9]" />
                          <span
                            className="absolute right-0 -top-5 h-5 w-5 rounded-br-[20px]"
                            style={{ backgroundColor: SIDEBAR_BG }}
                          />
                          <span
                            className="absolute right-0 -bottom-5 h-5 w-5 rounded-tr-[20px]"
                            style={{ backgroundColor: SIDEBAR_BG }}
                          />
                          <span
                            className="absolute right-0 -top-5 h-5 w-5 bg-[#F9F9F9]"
                            style={{
                              WebkitMaskImage:
                                "radial-gradient(circle 20px at 0 0, transparent 0, transparent 20px, black 21px)",
                              maskImage:
                                "radial-gradient(circle 20px at 0 0, transparent 0, transparent 20px, black 21px)",
                            }}
                          />
                          <span
                            className="absolute right-0 -bottom-5 h-5 w-5 bg-[#F9F9F9]"
                            style={{
                              WebkitMaskImage:
                                "radial-gradient(circle 20px at 0 100%, transparent 0, transparent 20px, black 21px)",
                              maskImage:
                                "radial-gradient(circle 20px at 0 100%, transparent 0, transparent 20px, black 21px)",
                            }}
                          />
                        </>
                      )}
                      <div
                        className={`relative z-[1] flex w-full items-center gap-3 py-3 pl-3 pr-4 ${
                          active
                            ? "font-bold text-[#0B1727]"
                            : "font-light text-gray-400 hover:text-white"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                            active ? "bg-[#0B1727]" : "bg-[#263D5C8F]"
                          }`}
                        >
                          <img
                            src={item.icon}
                            alt=""
                            className="h-5 w-5 object-contain"
                          />
                          {item.name === "Messages" &&
                            totalUnreadMessages > 0 && (
                              <div className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {totalUnreadMessages > 99
                                  ? "99+"
                                  : totalUnreadMessages}
                              </div>
                            )}
                        </div>
                        <span className="text-[14px]">{item.name}</span>
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
                  alt={`${authUser.name}'s Profile`}
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
                  {authUser.name}
                </h3>
                <p className="truncate text-[11px] font-light text-white/75">
                  {authUser.position && authUser.company_name
                    ? `${authUser.position} at ${authUser.company_name}`
                    : authUser.position || authUser.company_name || ""}
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
                  alt={`${authUser.name}'s Profile`}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = profileImage;
                  }}
                />
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-white">
                  {authUser.name}
                </h4>
                <p className="text-[11px] text-gray-300">
                  {authUser.position || "Member"}
                </p>
              </div>
            </div>

            <ul className="mb-2 space-y-1 border-b border-secondaryWhite pb-2">
              {PROFILE_SHOWCASE_ITEMS.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 text-white/80 hover:bg-secondaryWhite hover:text-[#0b1727]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-deepBlack text-white">
                      {item.icon}
                    </div>
                    <span className="text-[13px]">{item.name}</span>
                  </Link>
                </li>
              ))}
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
        sidebarOpen={true}
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
        onDealCardsUpdate={() => {}}
      />
    </div>
  );
};
