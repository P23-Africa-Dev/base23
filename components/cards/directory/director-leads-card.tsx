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
            className={`relative h-57.5 w-full overflow-hidden rounded-xl transition-all duration-200 ${
                isSelected
                    ? 'ring-2 ring-deepGreen shadow-lg shadow-deepGreen/20'
                    : 'shadow-[0px_2px_8px_rgba(0,0,0,0.12),0px_1px_3px_rgba(0,0,0,0.08)]'
            }`}
        >
            {/* Background image — fills the full card */}
            <div
                style={{ backgroundImage: `url(${user.imageSrc})` }}
                className="absolute inset-0 z-0 bg-cover bg-top"
            />

            {/* Frosted bottom panel — absolute, overlays the photo */}
            <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-xs" style={{ background: '#FFFFFFCC', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }} />
                <div className="relative px-3 py-2.5">
                        {/* Name + location row */}
                        <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-[13px] font-bold leading-tight text-darkBlue">
                                    {formatNameCharacters(user.name, 12)}
                                </h3>
                                <div className="mt-0.5 flex items-center gap-1">
                                    <img src={images.desktopLocation} className="h-3 w-3 opacity-70" alt="" />
                                    <p className="truncate text-[10px] font-normal text-darkBlue/70">{user.location}</p>
                                </div>
                            </div>
                            {/* Link icon */}
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B1727]">
                                <img src={images.directoryConnect} className="h-3 w-3 object-contain" alt="Link" />
                            </div>
                        </div>

                        {/* Rating + title row */}
                        <div className="mt-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-light text-darkBlue">{user.rating}</span>
                                <Star className="h-4 w-4 fill-[#27E6A7] text-[#27E6A7]" />
                            </div>
                            <p className="text-right text-[9px] font-bold text-darkBlue/80">{user.title}</p>
                        </div>
                </div>
            </div>
        </Card>
    );
};
