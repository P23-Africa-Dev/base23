'use client';

import images from '@/constants/image';
import { formatText } from '@/utils/format-character';
import { Star } from 'lucide-react';
import React from 'react';
import { DirectorUser } from '@/dummyDatas/director';

interface DirectorListCardProps {
    user: DirectorUser;
    isSelected?: boolean;
}

const DirectorListCard: React.FC<DirectorListCardProps> = ({ user, isSelected }) => {
    return (
        <div
            className={`relative flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-3 transition-all duration-200 ${
                isSelected
                    ? 'border-2 border-deepGreen shadow-md shadow-deepGreen/20'
                    : 'shadow-[0px_2px_10px_rgba(0,0,0,0.07),0px_1px_4px_rgba(0,0,0,0.05)]'
            }`}
        >
            {/* Avatar */}
            <div className="relative h-22.5 w-22.5 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <div
                    style={{ backgroundImage: `url(${user.imageSrc})` }}
                    className="absolute inset-0 bg-cover bg-top"
                />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-darkBlue xl:text-[15px]">{user.name}</h3>
                        <div className="mt-0.5 flex items-center gap-1">
                            <img src={images.directoryListLocation} className="h-3.5 w-3.5 shrink-0 object-contain" alt="" />
                            <p className="truncate text-[10px] font-medium text-darkBlue/60">{user.location}</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <span className="text-sm font-medium text-gray-600">{user.rating}</span>
                        <Star className="h-4 w-4 fill-[#27E6A7] text-[#27E6A7]" />
                    </div>
                </div>

                <div className="mt-3 flex justify-between gap-2 text-sm">
                    <div>
                        <p className="text-[10px] font-semibold text-darkGreen">Title</p>
                        <p className="text-[11px] font-bold text-darkBlue">{formatText(user.title, 15)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-darkGreen">Industry</p>
                        <p className="text-[11px] font-bold text-darkBlue">{user.industry}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectorListCard;
