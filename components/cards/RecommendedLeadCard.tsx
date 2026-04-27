'use client';

import images from '@/constants/image';
import { Star } from 'lucide-react';
import React from 'react';

interface RecommendedLeadCardProps {
    name: string;
    email?: string;
    position?: string;
    industry?: string;
    rating?: number;
    logo?: string;
    type?: 'person' | 'company';
}

const RecommendedLeadCard: React.FC<RecommendedLeadCardProps> = ({
    name,
    email,
    position,
    industry,
    rating = 4.6,
    logo,
    type = 'person',
}) => {
    // Default icons based on type
    const defaultIcon = type === 'company' ? images.buildingleads : images.userCheckleads;
    const displayIcon = logo || defaultIcon;

    return (
        <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50/50 transition-colors">
            {/* Lead Icon/Avatar */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#F5F7FA] p-2">
                <img
                    src={displayIcon}
                    alt={`${name}'s icon`}
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultIcon;
                    }}
                />
            </div>

            {/* Lead Info */}
            <div className="flex flex-1 flex-col gap-0.5">
                <h4 className="text-[15px] font-semibold text-[#193E47]">{name}</h4>
                {email && (
                    <p className="text-[11px] text-gray-500">{email}</p>
                )}
                {position && (
                    <p className="text-[11px] text-gray-500">{position}</p>
                )}
                {industry && !position && (
                    <p className="text-[11px] text-gray-500">{industry}</p>
                )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700">{rating?.toFixed(1) || '4.6'}</span>
                <Star className="h-5 w-5 fill-[#CFE96D] text-[#CFE96D]" />
            </div>
        </div>
    );
};

export default RecommendedLeadCard;
