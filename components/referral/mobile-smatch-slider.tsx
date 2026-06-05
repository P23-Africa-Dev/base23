'use client';

import images from '@/constants/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import SmartMatchPreviewPopup, { type SmartMatchPreviewData, type CompatibilityBreakdown } from '@/components/ui/smart-match-preview-popup';

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

const DRAG_THRESHOLD = 50;

// Smooth spring animation configs
const cardSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

const stackSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
  mass: 1,
};


export default function MobileReferralCardSlider({
  data,
  onMatch,
  showEmpty = false,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // Track swipe direction for animation
  const [previewUser, setPreviewUser] = useState<SliderConnection | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const isDragging = useRef(false);

  // Handle card click to open preview
  const handleCardClick = (user: SliderConnection) => {
    if (!isDragging.current) {
      setPreviewUser(user);
      setIsPreviewOpen(true);
    }
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
        <div className="relative h-[365px] w-[250px]">
          {[0, 1, 2].reverse().map((stackIndex) => {
            const isTop = stackIndex === 0;

            return (
              <motion.div
                key={`empty-${stackIndex}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  scale: 1 - stackIndex * 0.05,
                  rotate: stackIndex === 1 ? -6 : stackIndex === 2 ? 6 : 0,
                  y: stackIndex * 6,
                  opacity: 1 - stackIndex * 0.15,
                }}
                transition={stackSpring}
              >
                <MobileEmptyCard showMessage={isTop} />
              </motion.div>
            );
          })}

          {/* Disabled Match Button */}
          <div className="absolute -bottom-20 left-1/2 -translate-y-[4px]">
            <button
              disabled
              className="rounded-full bg-gray-300 px-8 py-3.5 text-[12px] font-semibold text-gray-500 cursor-not-allowed shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)]"
            >
              Match us!
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const activeUser = data[activeIndex];

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

  const handleDragEnd = (_: any, info: any) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Use velocity for quick swipes, offset for slow drags
    if (velocity < -300 || offset < -DRAG_THRESHOLD) {
      goNext();
    } else if (velocity > 300 || offset > DRAG_THRESHOLD) {
      goPrev();
    }

    isDragging.current = false;
  };

  return (
    <div className="relative h-[365px] w-[250px]">
      {/* Invisible drag overlay - captures gestures without moving visually */}
      <motion.div
        className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => (isDragging.current = true)}
        onDragEnd={handleDragEnd}
        style={{ touchAction: 'pan-y' }}
      />

      {/* Stacked cards - animate in place */}
      <AnimatePresence mode="popLayout" initial={false}>
        {[0, 1, 2].reverse().map((stackIndex) => {
          const user = data[(activeIndex + stackIndex) % data.length];
          const isTop = stackIndex === 0;

          return (
            <motion.div
              key={`${user.id}-${stackIndex}-${activeIndex}`}
              className="absolute inset-0 pointer-events-none"
              initial={{
                scale: 1 - stackIndex * 0.05,
                rotate: stackIndex === 1 ? -6 : stackIndex === 2 ? 6 : 0,
                y: stackIndex * 6,
                opacity: 0,
                x: direction * 150,
              }}
              animate={{
                scale: 1 - stackIndex * 0.05,
                rotate: stackIndex === 1 ? -6 : stackIndex === 2 ? 6 : 0,
                y: stackIndex * 6,
                opacity: 1 - stackIndex * 0.15,
                x: 0,
              }}
              exit={{
                x: -direction * 150,
                opacity: 0,
                scale: 0.8,
                rotate: -direction * 10,
              }}
              transition={cardSpring}
            >
              <MobileCard user={user} onCardClick={() => handleCardClick(user)} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* 🔥 MOBILE MATCH ACTION (EXACT USER) */}
      <motion.div
        className="absolute -bottom-20 left-1/2 -translate-y-[4px] z-30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={() => handleCardClick(activeUser)}
          className="rounded-full bg-darkBlue px-8 py-3.5 text-[12px] font-semibold text-white shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:bg-darkBlue/90 active:bg-darkBlue"
        >
          Match us!
        </button>
      </motion.div>

      {/* Smart Match Preview Popup */}
      <SmartMatchPreviewPopup
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onMatch={handleMatchFromPreview}
        isLoading={isMatching}
        data={previewUser ? {
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
        } : null}
      />
    </div>
  );
}



type MobileCardProps = {
  user: SliderConnection;
  onCardClick?: () => void;
};

function MobileCard({ user, onCardClick }: MobileCardProps) {
  // Generate fallback avatar URL
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`;

  return (
    <div
      onClick={onCardClick}
      className="flex h-[365px] w-[250px] flex-col rounded-2xl bg-white p-3 shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)] cursor-pointer pointer-events-auto"
    >
      <div className="relative flex h-full w-full flex-col gap-3">
        {/* IMAGE */}
        <div className="relative h-screen w-full overflow-hidden rounded-3xl shadow-[1px_7px_2px_-1px_rgba(0,0,0,0.1),-2px_7px_2px_-1px_rgba(0,0,0,0.1)]">
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

        {/* OVERLAY */}
        <div
          style={{ backgroundImage: `url(${images.blurProfilename})` }}
          className="absolute bottom-24 left-1/2 w-full -translate-x-1/2 rounded-xl bg-cover bg-center bg-no-repeat px-3 text-right"
        >
          <div className="py-4 pr-3 text-white">
            <h1 className="text-xl leading-5 font-bold">{user.name}</h1>
            <p className="mt-1 text-sm font-medium">
              {user.role} {user.company}
            </p>
          </div>
        </div>

        {/* COMPATIBILITY */}
        <div className="flex w-full flex-col items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#193E47]">
              <div className="relative h-5 w-5">
                <img src={images.aiMagic} className="absolute object-contain" />
              </div>
            </div>

            <div className="leading-2">
              <h5 className="text-[7.4px]">Smart Matching</h5>
              <p className="text-[9px] font-bold">Compatibility</p>
            </div>

            <div className="text-[14.8px] font-extrabold">
              {user.compatibility}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty card for when there are no matches
type MobileEmptyCardProps = {
  showMessage?: boolean;
};

function MobileEmptyCard({ showMessage = false }: MobileEmptyCardProps) {
  return (
    <div className="flex h-[365px] w-[250px] flex-col rounded-2xl bg-white p-3 shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)]">
      <div className="relative flex h-full w-full flex-col gap-3">
        {/* EMPTY IMAGE PLACEHOLDER */}
        <div className="h-screen w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-[1px_7px_2px_-1px_rgba(0,0,0,0.1),-2px_7px_2px_-1px_rgba(0,0,0,0.1)] flex items-center justify-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-300">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* OVERLAY - Empty state */}
        <div
          style={{ backgroundImage: `url(${images.blurProfilename})` }}
          className="absolute bottom-24 left-1/2 w-full -translate-x-1/2 rounded-xl bg-cover bg-center bg-no-repeat px-3 text-right"
        >
          <div className="py-4 pr-3 text-white">
            <h1 className="text-xl leading-5 font-bold">—</h1>
            <p className="mt-1 text-sm font-medium">—</p>
          </div>
        </div>

        {/* COMPATIBILITY - Empty state */}
        <div className="flex w-full flex-col items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-gray-300">
              <div className="relative h-5 w-5">
                <img src={images.aiMagic} className="absolute object-contain opacity-50" />
              </div>
            </div>

            <div className="leading-2">
              <h5 className="text-[7.4px] text-gray-400">Smart Matching</h5>
              <p className="text-[9px] font-bold text-gray-400">Compatibility</p>
            </div>

            <div className="text-[14.8px] font-extrabold text-gray-400">
              —%
            </div>
          </div>
        </div>
      </div>

      {/* Show "No matches yet" message on top card */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm font-medium">No One Needs Your Help Yet</p>
            <p className="text-gray-400 text-xs mt-1">Users who need your expertise will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
