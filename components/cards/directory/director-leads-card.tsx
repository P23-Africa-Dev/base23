'use client';

import { Card } from '@/components/ui/card';
import images from '@/constants/image';
import { formatNameCharacters } from '@/utils/format-character';
import { Star } from 'lucide-react';
import React from 'react';
import { DirectorUser } from '@/dummyDatas/director';

interface DirectorLeadsCardProps {
    user: DirectorUser;
    isSelected?: boolean;
}

export const DirectorLeadsCard: React.FC<DirectorLeadsCardProps> = ({ user, isSelected }) => {
    return (
        <Card
            className={`relative flex h-57.5 w-full flex-col justify-end overflow-hidden rounded-xl transition-all duration-200 ${
                isSelected
                    ? 'ring-2 ring-deepGreen shadow-lg shadow-deepGreen/20'
                    : 'shadow-[0px_2px_8px_rgba(0,0,0,0.12),0px_1px_3px_rgba(0,0,0,0.08)]'
            }`}
        >
            {/* Background image */}
            <div
                style={{ backgroundImage: `url(${user.imageSrc})` }}
                className="absolute inset-0 z-0 bg-cover bg-top"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 z-10 bg-linear-to-t from-black/55 via-black/10 to-transparent" />

            {/* Bottom content */}
            <div className="relative z-20 px-3 pb-3">
                <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[13px] font-bold leading-tight text-white">
                            {formatNameCharacters(user.name, 12)}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-1">
                            <img src={images.desktopLocation} className="h-3.5 w-3.5 opacity-80" alt="" />
                            <p className="truncate text-[10px] font-normal text-white/85">{user.location}</p>
                        </div>
                    </div>

                    {/* Link icon */}
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B1727]/80">
                        <img src={images.directoryConnect} className="h-3 w-3 object-contain" alt="Link" />
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-light text-white">{user.rating}</span>
                        <Star className="h-4 w-4 fill-[#27E6A7] text-[#27E6A7]" />
                    </div>
                    <p className="text-right text-[9px] font-bold text-white/90">{user.title}</p>
                </div>
            </div>
        </Card>
    );
};
