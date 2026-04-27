import images from '@/constants/image';

export type SmartMatchCard = {
  id: number;
  size: 'sm' | 'md' | 'lg';
  image: string;
  name?: string;
  title?: string;
  compatibility: number;
};

export const SMART_MATCH_CARDS: SmartMatchCard[] = [
  { id: 1, size: 'sm', image: images.man1, compatibility: 78 },
  { id: 2, size: 'md', image: images.man2, compatibility: 84 },
  {
    id: 3,
    size: 'lg',
    image: images.man3,
    name: 'Jamal Agoro',
    title: 'CTO AfriLaw',
    compatibility: 92,
  },
  { id: 4, size: 'md', image: images.man4, compatibility: 81 },
  { id: 5, size: 'sm', image: images.man5, compatibility: 75 },
];






'use client';

import { useState } from "react";
import images from "@/constants/image";
import { SMART_MATCH_CARDS, SmartMatchCard } from "./smartMatchData";
import { MatchSidebar } from "./MatchSidebar";

/* ================= SIZE CLASS MAP ================= */

const CARD_SIZE_CLASSES = {
  sm: {
    wrapper: "h-[240px]",
    image: "w-[140px] rounded-2xl",
    dot: "h-[20px] w-[20px]",
  },
  md: {
    wrapper: "h-[320px]",
    image: "w-[185px] rounded-2xl",
    dot: "h-[26px] w-[26px]",
  },
  lg: {
    wrapper: "h-[400px]",
    image: "w-full rounded-3xl",
    dot: "hidden",
  },
} as const;

/* ================= MAIN COMPONENT ================= */

export function SmartMatchCards() {
  const [activeCard, setActiveCard] = useState<SmartMatchCard | null>(null);

  return (
    <>
      {/* 👇 REQUIRED CONTAINER */}
      <div className="relative z-10 flex max-h-27 w-full justify-center">
        <div className="flex gap-5">
          {SMART_MATCH_CARDS.map((card) => {
            const size = CARD_SIZE_CLASSES[card.size];

            return (
              <div
                key={card.id}
                className={`flex ${size.wrapper} flex-col items-center justify-center rounded-4xl bg-white p-3
                  shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.4),-2px_3px_5px_-1px_rgba(0,0,0,0.4)]`}
              >
                <div className="relative flex h-full flex-col gap-3">
                  {/* IMAGE */}
                  <div
                    style={{ backgroundImage: `url(${card.image})` }}
                    className={`h-screen ${size.image} overflow-hidden bg-cover bg-top bg-no-repeat`}
                  />

                  {/* CENTER CARD CONTENT */}
                  {card.size === "lg" && (
                    <>
                      {/* NAME OVERLAY */}
                      <div
                        style={{ backgroundImage: `url(${images.blurProfilename})` }}
                        className="absolute bottom-24 left-1/2 w-full -translate-x-1/2 rounded-xl bg-cover px-3"
                      >
                        <div className="py-4 pr-3 text-right text-white">
                          <h1 className="text-2xl font-bold">{card.name}</h1>
                          <p className="text-sm">{card.title}</p>
                        </div>
                      </div>

                      {/* COMPATIBILITY */}
                      <div className="flex w-full items-center gap-2 px-4">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#193E47]">
                          <img src={images.aiMagic} className="h-5 w-5" />
                        </div>

                        <div className="leading-3">
                          <h5 className="text-[7.4px]">Smart Matching</h5>
                          <p className="text-[10px] font-bold">Compatibility</p>
                        </div>

                        <div className="text-[17.8px] font-extrabold">
                          {card.compatibility}%
                        </div>

                        <button
                          onClick={() => setActiveCard(card)}
                          className="ml-2 rounded-full bg-darkBlue px-3 py-2.5 text-xs font-semibold text-white shadow"
                        >
                          Match us!
                        </button>
                      </div>
                    </>
                  )}

                  {/* SMALL / MEDIUM FOOTER */}
                  {card.size !== "lg" && (
                    <div className="flex w-full items-center gap-3 px-4">
                      <div className={`${size.dot} rounded-full bg-[#9669CE]`} />
                      <div className="h-1 flex-1 rounded-full bg-[#D55BB6]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= GLOBAL SIDEBAR ================= */}
      <MatchSidebar
        open={!!activeCard}
        data={activeCard}
        onClose={() => setActiveCard(null)}
      />
    </>
  );
}
