'use client';

import images from '@/constants/image';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { useState } from 'react';

/* ================= TYPES ================= */

type CardData = {
    id: number;
    image: string;
    name: string;
    title: string;
    compatibility: number;
};

type Direction = 'left' | 'right';

/* ================= DATA ================= */

const CARDS: CardData[] = [
    { id: 1, image: images.man3, name: 'Jamal Agoro', title: 'CTO AfriLaw', compatibility: 92 },
    { id: 2, image: images.man4, name: 'Kwame Williams', title: 'CTO AfriLaw', compatibility: 88 },
    { id: 3, image: images.man5, name: 'Stephan Odili', title: 'CTO AfriLaw', compatibility: 90 },
    { id: 4, image: images.man1, name: 'Emeka Okafor', title: 'Founder', compatibility: 85 },
];

const SWIPE_THRESHOLD = 120;

/* ================= HELPERS ================= */

const getCard = (index: number) => CARDS[(index + CARDS.length) % CARDS.length];

/* ================= MAIN ================= */

export function SmartMatchSlider() {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleSwipe = (direction: Direction) => {
        setActiveIndex((prev) => (direction === 'left' ? prev + 1 : prev - 1));
    };

    return (
        <div className="relative flex h-[420px] w-[280px] items-center justify-center">
            <AnimatePresence>
                {[0, 1, 2].map((stackIndex) => {
                    const card = getCard(activeIndex + stackIndex);

                    return (
                        <SwipeCard
                            key={`${card.id}-${stackIndex}`}
                            card={card}
                            stackIndex={stackIndex}
                            isActive={stackIndex === 0}
                            onSwipe={handleSwipe}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

function SwipeCard({
    card,
    stackIndex,
    isActive,
    onSwipe,
}: {
    card: CardData;
    stackIndex: number;
    isActive: boolean;
    onSwipe: (dir: Direction) => void;
}) {
    const baseRotation = stackIndex === 0 ? -3 : stackIndex === 1 ? 4 : -2;

    return (
        <motion.div
            className="absolute"
            drag={isActive ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                if (!isActive) return;

                if (info.offset.x > SWIPE_THRESHOLD) onSwipe('right');
                if (info.offset.x < -SWIPE_THRESHOLD) onSwipe('left');
            }}
            initial={{
                y: stackIndex * 14,
                scale: 1 - stackIndex * 0.05,
                rotate: baseRotation,
                opacity: 0,
            }}
            animate={{
                y: stackIndex * 14,
                scale: 1 - stackIndex * 0.05,
                rotate: baseRotation,
                opacity: stackIndex === 2 ? 0.5 : 1,
            }}
            exit={{
                x: isActive ? 420 : 0,
                rotate: isActive ? baseRotation + 15 : baseRotation,
                opacity: 0,
            }}
            transition={{
                type: 'spring',
                stiffness: 240,
                damping: 22,
            }}
            style={{
                zIndex: 100 - stackIndex,
                filter: stackIndex > 0 ? 'blur(2px)' : 'none',
            }}
            whileDrag={{
                rotate: isActive ? baseRotation + 8 : baseRotation,
            }}
        >
            <ProfileCard card={card} />
        </motion.div>
    );
}

function ProfileCard({ card }: { card: CardData }) {
    return (
        <div className="flex h-[365px] w-[250px] flex-col rounded-2xl bg-white p-3 shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)]">
            <div className="relative flex h-full w-full flex-col gap-3">
                <div
                    style={{
                        backgroundImage: `url(${card.image})`,
                    }}
                    className="h-screen w-full overflow-hidden rounded-3xl bg-cover bg-top bg-no-repeat shadow-[1px_7px_2px_-1px_rgba(0,0,0,0.1),-2px_7px_2px_-1px_rgba(0,0,0,0.1)]"
                ></div>

                {/* Overlay for the active card */}
                <div
                    style={{
                        backgroundImage: ` url(${images.blurProfilename})`,
                    }}
                    className="absolute bottom-24 left-1/2 w-full -translate-x-1/2 rounded-xl bg-cover bg-center bg-no-repeat px-3 text-right"
                >
                    <div className="py-4 pr-3 text-white">
                        <h1 className="text-xl leading-5 font-bold"> {card.name}</h1>
                        <p className="mt-1 text-sm font-medium">{card.title}</p>
                    </div>
                </div>

                <div className="flex w-full flex-col items-center gap-3 px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#193E47]">
                            <div className="relative h-5 w-5">
                                <img src={images.aiMagic} className="absolute object-contain" alt="" />
                            </div>
                        </div>

                        <div className="leading-2">
                            <h5 className="text-[7.4px]">Smart Matching </h5>
                            <p className="text-[9px] font-bold">Compatibility</p>
                        </div>
                        <div className="text-[14.8px] font-extrabold"> {card.compatibility}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
