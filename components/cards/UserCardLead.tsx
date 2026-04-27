'use client';

import Link from 'next/link';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import React from 'react';

interface UserCardProps {
    name: string;
    email: string;
    title: string;
    rating: number;
    iconSrc: string;
    similarityScore?: number;
    industry?: string;
    country?: string;
}

const UserCardLead: React.FC<UserCardProps> = ({ name, email, title, rating, iconSrc, similarityScore, industry, country }) => {
    return (
        <div  className="flex items-center space-x-4 border-b-3 bg-white p-4 ">
            <div className="relative flex h-[100px] w-[100px] items-center justify-center rounded-full ">
                <img src={iconSrc} alt={`${name}'s profile`} className="rounded-full object-center" />
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-darkBlue">{name}</h3>
                        </div>
                        <div className="flex flex-col items-start gap-1 leading-3 text-darkBlue">
                            <p className="text-[11px] font-light">{email}</p>
                            <p className="text-[11px] font-light">{title}</p>
                            {industry && (
                                <p className="text-[11px] mt-2 font-light text-gray-600">
                                    Industry: <span className="font-medium">{industry}</span>
                                </p>
                            )}
                            {country && (
                                <p className="text-[12px] font-light text-gray-600">
                                    Location: <span className="font-medium">{country}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-start space-x-1 pr-10 text-yellow-500 xl:pr-20">
                        {similarityScore && (
                            <div className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-800 self-end">{similarityScore}% match</div>
                        )}
                        <div className='flex items-center'>
                            <span className="text-sm font-medium mr-1 text-gray-600">{rating}</span>
                            <Star className="h-4.5 w-4.5 fill-darkGreen font-bold text-darkGreen" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCardLead;
