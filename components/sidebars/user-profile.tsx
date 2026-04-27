'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import images from '@/constants/image';
import { Star } from 'lucide-react';
import React from 'react';

// Helper to format and capitalize each word, similar to formatStringData in index.tsx
function formatStringData(data: string | null | undefined, fallback: string = 'Not specified'): string {
    if (!data || data.trim() === '') return fallback;
    const cleaned = data.trim().replace(/\s+/g, ' ').replace(/_/g, ' ');
    // Capitalize each word
    return cleaned
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

interface UserDetailedSidebarProps {
    name: string;
    title: string;
    imageSrc: string;
    reviews: string;
    baseLocation: string;
    operatesIn: string;
    bio: string;
    experience: string;
    interest: string;
    industry: string;
    companyStage: string;
    keyStrength: string;
    topGoal: string;
    brnMemberSince: string;
    responseRate: string;
    successfulDealsRate: string;
    children: React.ReactNode;
}


const UserDetailedSidebar: React.FC<UserDetailedSidebarProps> = ({
    name,
    title,
    imageSrc,
    reviews,
    baseLocation,
    operatesIn,
    bio,
    experience,
    interest,
    industry,
    companyStage,
    keyStrength,
    topGoal,
    brnMemberSince,
    responseRate,
    successfulDealsRate,
    children,
}) => {
    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>{children}</SheetTrigger>

                <div id="sidebar-profile">
                    <SheetContent
                        side="right"
                        className="w-[390px] max-w-[275px] border-none bg-transparent sm:max-w-md md:w-auto md:max-w-[700px] lg:max-w-[710px] [&>button.absolute.right-4.top-4]:hidden"
                    >
                        <div className="h-full w-full overflow-y-scroll md:overflow-hidden pl-2 rounded-3xl bg-white md:p-4 shadow-lg md:flex md:flex-row">
                            {/* Left Column - User Profile */}
                            <div className="no-scrollbar flex  w-full flex-col overflow-y-auto md:overflow-hidden rounded-l-3xl bg-transparent py-4 md:py-0 pl-4 md:pl-6 shadow-none md:h-auto md:w-[43%] md:bg-[#A7D5DD] md:shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]">
                                {/***************************** Top Area */}
                                <div className="flex  mt-1 md:mt-0 gap-x-3 md:gap-x-0 items-start md:items-center pr-6 text-center md:flex-col">
                                    <div className="relative  md:mt-10 flex w-20 h-20 md:h-28 md:w-28 lg:w-42 lg:h-42 items-center justify-center rounded-full bg-gradient-to-tr from-[#325A64] via-[#325A64] to-[#AC7CEE] p-1 shadow-[3px_5px_4px_2px_rgba(0,0,0,0.25),3px_2px_4px_3px_rgba(0,0,0,0.25)]">
                                        <div
                                            style={{
                                                backgroundImage: `url(${imageSrc})`,
                                            }}
                                            className=" w-17 h-17 md:w-25 md:h-25 lg:w-40 lg:h-40 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat "
                                        ></div>
                                    </div>

                                    <div className='flex flex-col md:items-center md:justify-center items-start justify-start '>
                                        {/* Headings */}
                                    

                                          <div className="text-darkBlue mt-2 md:mb-2 md:space-y-0 lg:mt-10 text-left md:text-center">
                                            <h1 className="text-[12px]  leading-3 font-extrabold md:text-base lg:text-xl lg:leading-4.5 lg:max-w-[165px]">{formatStringData(name, 'Unknown User')}</h1>
                                            <p className="text-[9.5px] md:text-xs font-normal pr-8 md:pr-0 lg:text-sm  leading-3 mt-1">{formatStringData(title, 'Position Not Specified')}</p>
                                        </div>

                                        {/* Descriptions */}

                                        <p className="text-[8.2px] md:text-xs md:leading-4 font-medium leading-3 pr-6 text-darkBlue mt-1 lg:px-8  md:pr-0 md:mt-1.5 text-left md:text-center">{formatStringData(topGoal, 'Goals Not Specified')}</p>

                                        <div className="hidden items-center space-x-2 md:mt-4 md:flex">
                                            <p className="text-base font-bold text-darkBlue underline">{formatStringData(reviews, '0')}</p>
                                            <Star className="h-5 w-5 fill-[#978FED] text-[#978FED]" />
                                        </div>
                                    </div>
                                </div>
                                {/***************************** Bottom Area */}
                                <div className="mt-8 md:mt-14 md:mb-26">
                                    <div className="w-full space-y-2 text-left">
                                        <h5 className="text-xs lg:text-[13px] font-bold text-darkBlue">
                                            Base Location
                                            <span className="block text-[10.5px] lg:text-[11.5px] font-normal">{formatStringData(baseLocation, 'Location Not Specified')}</span>
                                        </h5>
                                        <h5 className="text-xs font-bold text-darkBlue">
                                            Operates In
                                            <span className="block  text-[10.5px] lg:text-[11.5px]  font-normal">{formatStringData(operatesIn, 'Location Not Specified')}</span>
                                        </h5>
                                    </div>
                                    <div className="mt-4 flex w-full items-start space-x-2">
                                        <button className="flex items-center justify-center gap-2 rounded-full bg-darkBlue p-2 whitespace-nowrap text-white shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] w-9 h-9 lg:h-9 lg:w-9">
                                            <img src={images.userMailVoice} className="w-6 h-5 lg:h-5 lg:w-5" alt="" />
                                        </button>
                                        <button className="flex items-center justify-center gap-2 rounded-full bg-darkBlue p-2 whitespace-nowrap text-white shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]  w-9 h-9 lg:h-9 lg:w-9">
                                            <img src={images.userMessage} className="w-6 h-5 lg:h-5 lg:w-5" alt="" />
                                        </button>

                                        <button className="-mr-4 flex w-[40%] items-center justify-center gap-2 rounded-full bg-darkBlue py-2.5 md:py-3.5 px-2 lg:w-fit text-[9px] font-semibold whitespace-nowrap text-[#D7F6EC] shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] lg:-mr-0">
                                            Request Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Right Column - Detailed Info */}
                            <div className="bio-info-scrollbar  w-full overflow-y-auto p-3  md:max-h-max md:w-[57%] md:p-6">
                                <div className="">
                                    <div className="text-darkBlue">
                                        <h2 className="text-sm lg:text-base font-extrabold">Bio</h2>
                                        <p className="mt-1 text-[9.6px] lg:text-[11px] font-medium">{formatStringData(bio, 'No Bio Available')}</p>
                                    </div>
                                    <div className="mt-6 grid grid-cols-2 gap-y-4 text-[10px] lg:text-[11px] text-darkBlue">
                                        <div>
                                            <p className=" font-bold">Experience</p>
                                            <p className=" font-normal">{formatStringData(experience, 'Not Specified')}</p>
                                        </div>
                                        <div>
                                            <p className=" font-bold">Interest</p>
                                            <p className=" font-normal">{formatStringData(interest, 'Not Specified')}</p>
                                        </div>
                                        <div>
                                            <p className=" font-bold">Industry</p>
                                            <p className=" font-normal">{formatStringData(industry, 'Industry Not Specified')}</p>
                                        </div>
                                        <div>
                                            <p className=" font-bold">Company Stage</p>
                                            <p className=" font-normal">{formatStringData(companyStage, 'Stage Not Specified')}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className=" font-bold">Key Strength</p>
                                            <p className=" font-normal">{formatStringData(keyStrength, 'Not Specified')}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className=" font-bold">Top Goal</p>
                                            <p className=" font-normal">{formatStringData(topGoal, 'Goals Not Specified')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity */}
                                <div className="mt-6 rounded-br-4xl pb-6 bg-darkBlue px-5 py-4 lg:pb-14  text-secondaryWhite shadow-[1px_2px_0px_2px_rgba(0,0,0,0.2),1px_2px_1px_1px_rgba(0,0,0,0.2)]">
                                    <h2 className="text-sm font-bold">Activity & Reputation</h2>
                                    <div className="mt-4 flex flex-wrap gap-x-4 md:gap-x-0 md:flex-nowrap md:flex-col gap-y-4 text-sm">
                                        <div>
                                            <p className="font-bold text-[10px] lg:text-[11px]">BRN Member Since</p>
                                            <p className="text-[10px] lg:text-[11px] font-light">{formatStringData(brnMemberSince, 'Not Specified')}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[10px] lg:text-[11px]">Response Rate</p>
                                            <p className="text-[10px] lg:text-[11px] font-light">{formatStringData(responseRate, 'Not Specified')}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="font-bold text-[10px] lg:text-[11px]">Successful Deals Rate</p>
                                            <p className="text-[10px] lg:text-[11px] font-light">{formatStringData(successfulDealsRate, 'Not Specified')}</p>
                                        </div>
                                    </div>

                                    <a href="#" className="mt-4 md:mt-16 block text-xs font-medium italic underline">
                                        View Reviews
                                    </a>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </div>
            </Sheet>
        </div>
    );
};

export default UserDetailedSidebar;

















