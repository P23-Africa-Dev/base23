"use client";

import SmartMatchPreviewPopup, {
  type CompatibilityBreakdown,
} from "@/components/ui/smart-match-preview-popup";
import images from "@/constants/image";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucide-react";
import { useCallback, useRef, useState } from "react";

// Connection type for slider (compatible with both API and dummy data)
export type SliderConnection = {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  compatibility: number;
  compatibility_breakdown?: CompatibilityBreakdown;
  // Extended fields for preview popup
  industry?: string | null;
  match_reasons?: string[];
  why_this_match?: string;
  user_needs?: string | null;
  preferred_industry?: string | null;
  business_level?: string | null;
  selected_tags?: string[] | null;
};

type Props = {
  data: SliderConnection[];
  onMatch: (user: SliderConnection) => void;
  showEmpty?: boolean;
};

/** Fixed visible slots */
const SLOT_OFFSETS = [-2, -1, 0, 1, 2];
const DRAG_THRESHOLD = 60;

// Tween animation for layout changes
const layoutTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
  mass: 0.8,
};

export default function ReferralCardSlider({
  data,
  onMatch,
  showEmpty = false,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right, 0 for none
  const [previewUser, setPreviewUser] = useState<SliderConnection | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const isDragging = useRef(false);

  // Handle card click to open preview
  const handleCardClick = (user: SliderConnection) => {
    console.log("Card clicked - Full user data:", user);
    console.log("User needs:", user.user_needs);
    console.log("Preferred industry:", user.preferred_industry);
    setPreviewUser(user);
    setIsPreviewOpen(true);
  };

  // Handle match from preview popup
  const handleMatchFromPreview = async () => {
    if (!previewUser) return;
    setIsMatching(true);
    try {
      await onMatch(previewUser);
      setIsPreviewOpen(false);
      setPreviewUser(null);
    } finally {
      setIsMatching(false);
    }
  };

  // Close preview popup
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewUser(null);
  };

  // If no data and showEmpty is true, render empty state cards
  if (!data || data.length === 0) {
    if (showEmpty) {
      return (
        <div className="relative flex gap-x-3">
          {SLOT_OFFSETS.map((slot) => (
            <motion.div
              key={`empty-${slot}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={layoutTransition}
            >
              <EmptyCardSlot slot={slot} />
            </motion.div>
          ))}
        </div>
      );
    }
    return null;
  }

  /** Circular resolver */
  const getUserAt = (offset: number) => {
    const index = (activeIndex + offset + data.length) % data.length;
    return data[index];
  };

  /** Navigate to next card */
  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % data.length);
  }, [data.length]);

  /** Navigate to previous card */
  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => (i === 0 ? data.length - 1 : i - 1));
  }, [data.length]);

  /** Drag logic */
  const handleDragEnd = (_: any, info: any) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Use velocity for quick swipes, offset for slow drags
    if (velocity < -500 || offset < -DRAG_THRESHOLD) {
      goNext();
    } else if (velocity > 500 || offset > DRAG_THRESHOLD) {
      goPrev();
    }

    isDragging.current = false;
  };

  return (
    <div className="relative flex gap-x-3 select-none">
      {/* Invisible drag overlay - covers entire slider area for full card dragging */}
      <motion.div
        className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => (isDragging.current = true)}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "pan-y" }}
      />

      {/* Cards container - doesn't move, only cards animate */}
      <div className="relative flex gap-x-3 pointer-events-none">
        <AnimatePresence mode="popLayout" initial={false}>
          {SLOT_OFFSETS.map((slot) => {
            const user = getUserAt(slot);
            const isCenter = slot === 0;

            return (
              <motion.div
                key={`${user.id}-${slot}-${activeIndex}`}
                layout
                initial={{
                  opacity: 0,
                  scale: 0.85,
                  x: direction * 100,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  x: -direction * 100,
                }}
                transition={layoutTransition}
                whileHover={isCenter ? { scale: 1.02, y: -5 } : undefined}
              >
                <CardSlot
                  slot={slot}
                  user={user}
                  onMatch={() => onMatch(user)}
                  onCardClick={() => handleCardClick(user)}
                  isCenter={isCenter}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Smart Match Preview Popup */}
      <SmartMatchPreviewPopup
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onMatch={handleMatchFromPreview}
        isLoading={isMatching}
        data={
          previewUser
            ? {
                id: previewUser.id,
                name: previewUser.name,
                position: previewUser.role,
                company: previewUser.company,
                industry: previewUser.industry || null,
                image: previewUser.image,
                compatibility: previewUser.compatibility,
                compatibility_breakdown: previewUser.compatibility_breakdown,
                match_reasons: previewUser.match_reasons,
                why_this_match: previewUser.why_this_match,
                user_needs: previewUser.user_needs || null,
                preferred_industry: previewUser.preferred_industry,
                business_level: previewUser.business_level,
                selected_tags: previewUser.selected_tags,
              }
            : null
        }
      />
    </div>
  );
}

type CardSlotProps = {
  slot: number;
  user: SliderConnection;
  onMatch: () => void;
  onCardClick: () => void;
  isCenter: boolean;
};

type SlotConfig = {
  cardSize: string;
  imageRadius: string;
  overlayBottom: string;
  titleClass: string;
  roleClass: string;
  iconSize: string;
  iconInnerSize: string;
  compatibilityText: string;
  buttonClass: string;
};

const slotConfig: Record<number, SlotConfig> = {
  "-2": {
    cardSize: "h-[245px] w-[200px]",
    imageRadius: "rounded-2xl",
    overlayBottom: "bottom-14",
    titleClass: "text-base leading-2",
    roleClass: "text-[11px]",
    iconSize: "h-[15px] w-[15px]",
    iconInnerSize: "h-3 w-3",
    compatibilityText: "text-[10px]",
    buttonClass: "px-2 py-1 text-[7px]",
  },
  "-1": {
    cardSize: "h-[290px] w-[220px]",
    imageRadius: "rounded-2xl",
    overlayBottom: "bottom-16",
    titleClass: "text-lg leading-3",
    roleClass: "text-sm",
    iconSize: "h-[20px] w-[20px]",
    iconInnerSize: "h-3.5 w-3.5",
    compatibilityText: "text-[12px]",
    buttonClass: "px-2 py-1.5 text-[8px]",
  },
  "0": {
    cardSize: "h-[370px] w-[260px]",
    imageRadius: "rounded-3xl",
    overlayBottom: "bottom-24",
    titleClass: "text-xl leading-5",
    roleClass: "text-sm",
    iconSize: "h-[25px] w-[25px]",
    iconInnerSize: "h-4.5 w-4.5",
    compatibilityText: "text-[13.8px]",
    buttonClass: "px-[29px] py-[11.5px] text-[9px]",
  },
  "1": {
    cardSize: "h-[290px] w-[220px]",
    imageRadius: "rounded-2xl",
    overlayBottom: "bottom-16",
    titleClass: "text-lg leading-3",
    roleClass: "text-sm",
    iconSize: "h-[20px] w-[20px]",
    iconInnerSize: "h-3.5 w-3.5",
    compatibilityText: "text-[12px]",
    buttonClass: "px-2 py-1.5 text-[8px]",
  },
  "2": {
    cardSize: "h-[245px] w-[200px]",
    imageRadius: "rounded-2xl",
    overlayBottom: "bottom-14",
    titleClass: "text-base leading-2",
    roleClass: "text-[11px]",
    iconSize: "h-[15px] w-[15px]",
    iconInnerSize: "h-3 w-3",
    compatibilityText: "text-[10px]",
    buttonClass: "px-2 py-1 text-[7px]",
  },
};

function CardSlot({ slot, user, onMatch, onCardClick, isCenter }: CardSlotProps) {
  const config = slotConfig[slot];

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`;

  return (
    <div
      onClick={onCardClick}
      className={`flex ${config.cardSize} flex-col items-center justify-center rounded-3xl bg-white p-3 shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.4),-2px_3px_5px_-1px_rgba(0,0,0,0.4)] cursor-pointer pointer-events-auto relative z-30 transition-transform hover:scale-[1.01]`}
    >
      <div className="relative flex h-full w-full flex-col gap-3">
        {/* IMAGE */}
        <div
          className={`relative h-screen w-full overflow-hidden ${config.imageRadius}`}
        >
          <img
            src={user.image || fallbackAvatar}
            alt={user.name}
            className="h-full w-full object-cover object-top"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackAvatar;
            }}
          />
        </div>

        {/* OVERLAY — center only */}
        {isCenter && (
          <div
            style={{ backgroundImage: `url(${images.blurProfilename})` }}
            className={`absolute left-1/2 ${config.overlayBottom} w-full -translate-x-1/2 rounded-xl bg-cover bg-center bg-no-repeat px-3 text-right`}
          >
            <div className="py-4 pr-3 text-white">
              <h1 className={`font-bold ${config.titleClass}`}>{user.name}</h1>
              <p className={`mt-1 font-medium ${config.roleClass}`}>
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* BOTTOM — full bar for center, circle+line for sides */}
        {isCenter ? (
          <div className="flex flex-col items-center gap-0.5 px-4">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex ${config.iconSize} items-center justify-center rounded-full bg-[#193E47]`}
              >
                <div className={`relative ${config.iconInnerSize}`}>
                  <img
                    src={images.aiMagic}
                    className="absolute inset-0 h-full w-full object-contain"
                    alt=""
                  />
                </div>
              </div>

              <div className="leading-[10px]">
                <h5 className="text-[6.5px] font-medium">Smart Matching</h5>
                <p className="text-[9px] font-bold">Compatibility</p>
              </div>

              <div className={`font-extrabold ${config.compatibilityText}`}>
                {user.compatibility}%
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMatch();
                }}
                className={`ml-1.5 rounded-full bg-darkBlue font-bold whitespace-nowrap text-white shadow-[1px_2px_4px_-1px_rgba(0,0,0,0.2)] pointer-events-auto relative z-30 ${config.buttonClass}`}
              >
                View
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-300" />
            <div className="flex-1 h-[3px] rounded-full bg-gradient-to-r from-pink-300 to-pink-200" />
          </div>
        )}
      </div>
    </div>
  );
}

// Empty card slot component for when there are no matches
type EmptyCardSlotProps = {
  slot: number;
};

function EmptyCardSlot({ slot }: EmptyCardSlotProps) {
  const config = slotConfig[slot];
  const isCenter = slot === 0;

  // Calculate icon size based on card size
  const iconSize =
    slot === 0
      ? "w-20 h-20"
      : slot === -1 || slot === 1
        ? "w-16 h-16"
        : "w-12 h-12";

  return (
    <div
      className={`flex ${config.cardSize} flex-col items-center justify-center rounded-3xl bg-white p-3 shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.4),-2px_3px_5px_-1px_rgba(0,0,0,0.4)]`}
    >
      <div className="relative flex h-full w-full flex-col gap-3">
        {/* EMPTY IMAGE PLACEHOLDER */}
        <div
          className={`h-screen w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ${config.imageRadius} flex items-center justify-center`}
        >
          <div
            className={`${iconSize} flex items-center justify-center rounded-full bg-gray-300`}
          >
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        </div>

        {/* OVERLAY - Empty state */}
        <div
          style={{ backgroundImage: `url(${images.blurProfilename})` }}
          className={`absolute left-1/2 ${config.overlayBottom} w-full -translate-x-1/2 rounded-xl bg-cover bg-center bg-no-repeat px-3 text-right`}
        >
          <div className="py-4 pr-3 text-white">
            <h1 className={`font-bold ${config.titleClass}`}>—</h1>
            <p className={`mt-1 font-medium ${config.roleClass}`}>—</p>
          </div>
        </div>

        {/* COMPATIBILITY - Empty state */}
        <div className="flex flex-col items-center gap-0.5 px-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex ${config.iconSize} items-center justify-center rounded-full bg-gray-300`}
            >
              <div className={`relative ${config.iconInnerSize}`}>
                <img
                  src={images.aiMagic}
                  className="absolute inset-0 h-full w-full object-contain opacity-50"
                  alt=""
                />
              </div>
            </div>

            <div className="leading-[10px]">
              <h5 className="text-[6.5px] font-medium text-gray-400">
                Smart Matching
              </h5>
              <p className="text-[9px] font-bold text-gray-400">
                Compatibility
              </p>
            </div>

            <div
              className={`font-extrabold ${config.compatibilityText} text-gray-400`}
            >
              —%
            </div>

            <button
              disabled
              className={`ml-1.5 rounded-full bg-gray-300 font-semibold whitespace-nowrap text-gray-500 cursor-not-allowed ${config.buttonClass}`}
            >
              Match us!
            </button>
          </div>
        </div>
      </div>

      {/* Center card gets the "No matches yet" message */}
      {isCenter && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm font-medium">
              No One Needs Your Help Yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Users who need your expertise will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
