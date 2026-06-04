'use client';

export const dynamic = 'force-dynamic';

import images from '@/constants/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { dummyDirectorLeads, dummyDirectorList } from '@/dummyDatas/director';
import { DirectorUser } from '@/dummyDatas/director';
import DirectorProfileSidebar from '@/components/sidebars/director-profile-sidebar';
import DirectorListCard from '@/components/cards/directory/director-list-card';
import { DirectorLeadsCard } from '@/components/cards/directory/director-leads-card';
import { X } from 'lucide-react';

export default function DirectorPage() {
    const [selectedUser, setSelectedUser] = useState<DirectorUser>(dummyDirectorLeads[0]);
    const [showMobileProfile, setShowMobileProfile] = useState(false);

    const handleSelectUser = (user: DirectorUser) => {
        setSelectedUser(user);
        setShowMobileProfile(true);
    };

    return (
        <AppLayout>
            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                <div className="absolute z-[2] hidden h-full w-full bg-[#031C5B] lg:block dark:lg:bg-gray-900" />

                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{ backgroundImage: `url(${images.uibg})` }}
                >
                    {/* ── Main scroll container ── */}
                    <div className="no-scrollbar relative z-10 flex h-screen max-h-[96vh] w-full flex-col overflow-y-auto px-2 pb-1 lg:overflow-hidden lg:py-0 lg:pr-4 lg:pl-7 xl:pr-2 xl:pl-16">

                        <div className="grid grid-cols-1 gap-5 lg:h-full lg:grid-cols-[1fr_300px] lg:p-4 xl:grid-cols-[1fr_320px] xl:p-0 page-transition">

                            {/* ── LEFT COLUMN ── */}
                            <div className="flex flex-col lg:h-full lg:overflow-hidden lg:pb-4 lg:pr-4 lg:pl-3">

                                {/* Header */}
                                <div className="rounded-md bg-[#0B2B33] lg:bg-transparent">
                                    <div className="flex items-center justify-between overflow-hidden border-b-0 bg-transparent px-3 pt-4 pb-3 lg:px-0">

                                        <h2 className="hidden w-45 text-[19.5px] font-normal leading-6 text-gray-800 italic lg:block xl:w-67.5">
                                            Find your Next{' '}
                                            <span className="block text-3xl font-extrabold leading-3 text-deepBlue">
                                                Sales Rep
                                            </span>
                                        </h2>

                                        <h2 className="-mt-1 ml-5 w-[120px] text-[9.8px] font-light leading-3 text-white italic sm:w-[200px] sm:text-[14px] lg:hidden">
                                            Find your Next{' '}
                                            <span className="text-[13px] font-extrabold sm:text-xl">
                                                Sales Rep
                                            </span>
                                        </h2>

                                        <div className="flex w-full items-center justify-end gap-2 lg:gap-5">
                                            <div className="relative w-full max-w-[280px] lg:max-w-[450px]">
                                                <input
                                                    type="text"
                                                    placeholder="Search"
                                                    className="w-full rounded-full border-0 bg-[#D3F1E729] px-4 py-2.5 pr-10 text-xs italic text-white placeholder:text-[11px] placeholder:font-light placeholder:text-white focus:outline-none focus:ring-0 lg:bg-[#E3F4EB] lg:px-6 lg:py-[15px] lg:pr-12 lg:text-deepBlack lg:placeholder:text-[15px] lg:placeholder:font-normal lg:placeholder:text-gray-600"
                                                />
                                                <button className="absolute top-1/2 right-4 -translate-y-1/2 lg:right-5">
                                                    <img src={images.desktopSearch} className="h-5 w-5 lg:h-[22px] lg:w-[22px]" alt="Search" />
                                                </button>
                                            </div>
                                            <button className="hidden items-center justify-center p-2 lg:flex">
                                                <img src={images.preferenceHorizontal} className="h-6 w-6 lg:h-7 lg:w-7" alt="Filter" />
                                            </button>
                                            <button className="hidden items-center justify-center rounded-full bg-[#0B1727] p-2 lg:flex lg:h-[50px] lg:w-[50px]">
                                                <img src={images.refreshNew} className="h-4 w-4 lg:h-[22px] lg:w-[22px]" alt="Refresh" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <Tabs defaultValue="all" className="flex flex-col lg:flex-1 lg:overflow-hidden">
                                    <TabsList className="mx-auto mb-4 no-scrollbar grid w-[95%] shrink-0 grid-cols-3 gap-5 overflow-x-auto rounded-full bg-[#F1EEEE] px-3 shadow-[0px_2px_5px_-1px_rgba(0,0,0,0.2)] md:overflow-hidden lg:mb-6 lg:flex lg:h-[46px] lg:w-full lg:max-w-[480px] lg:items-center lg:justify-center lg:gap-8 lg:rounded-[14px] lg:bg-white lg:px-3 lg:shadow-sm">
                                        <TabsTrigger
                                            value="all"
                                            className="-mt-0.5 -ml-1 rounded-full px-10 py-2.25 text-[8px] font-normal text-deepBlue data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:m-0 lg:rounded-none lg:border-b-[3px] lg:border-transparent lg:px-4 lg:py-[10px] lg:text-[13.5px] lg:font-medium lg:text-gray-500 lg:data-[state=active]:border-b-[#0B1727] lg:data-[state=active]:bg-transparent lg:data-[state=active]:font-bold lg:data-[state=active]:text-[#0B1727]"
                                        >
                                            All Directory
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="shortlisted"
                                            className="-mx-2.5 -mt-0.5 rounded-full px-9.5 py-2.25 text-[8px] font-normal text-deepBlue data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:m-0 lg:rounded-none lg:border-b-[3px] lg:border-transparent lg:px-4 lg:py-[10px] lg:text-[13.5px] lg:font-medium lg:text-gray-500 lg:data-[state=active]:border-b-[#0B1727] lg:data-[state=active]:bg-transparent lg:data-[state=active]:font-bold lg:data-[state=active]:text-[#0B1727]"
                                        >
                                            Shortlisted
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="pipeline"
                                            className="-mx-2.5 -mt-0.5 rounded-full px-10.5 py-2.25 text-[8px] font-normal text-deepBlue data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:m-0 lg:rounded-none lg:border-b-[3px] lg:border-transparent lg:px-4 lg:py-[10px] lg:text-[13.5px] lg:font-medium lg:text-gray-500 lg:data-[state=active]:border-b-[#0B1727] lg:data-[state=active]:bg-transparent lg:data-[state=active]:font-bold lg:data-[state=active]:text-[#0B1727]"
                                        >
                                            Hire Pipeline
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="no-scrollbar rounded-2xl bg-deepBlack pt-2 lg:flex-1 lg:overflow-y-auto lg:bg-transparent lg:pt-2">
                                        <div className="space-y-4 pb-6 lg:space-y-5 lg:pb-10">

                                            {/* Leads grid — 2 cols mobile, 4 cols desktop */}
                                            <div className="w-full grid grid-cols-2 gap-3 px-1 lg:grid-cols-4 lg:px-0">
                                                {dummyDirectorLeads.map((user) => (
                                                    <div key={user.id} onClick={() => handleSelectUser(user)} className="cursor-pointer">
                                                        <DirectorLeadsCard user={user} isSelected={selectedUser.id === user.id} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* List cards */}
                                            <div className="flex flex-col gap-3 px-1 lg:px-0">
                                                {dummyDirectorList.map((user) => (
                                                    <div key={user.id} onClick={() => handleSelectUser(user)} className="cursor-pointer">
                                                        <DirectorListCard user={user} isSelected={selectedUser.id === user.id} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="shortlisted">
                                        <div className="flex h-40 items-center justify-center text-gray-500">No shortlisted candidates yet.</div>
                                    </TabsContent>
                                    <TabsContent value="pipeline">
                                        <div className="flex h-40 items-center justify-center text-gray-500">No candidates in pipeline.</div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* ── RIGHT COLUMN — desktop only ── */}
                            <div className="hidden lg:flex lg:py-2 lg:pr-1">
                                <DirectorProfileSidebar user={selectedUser} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Mobile profile bottom sheet ── */}
                {showMobileProfile && (
                    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowMobileProfile(false)}
                        />

                        {/* Sheet */}
                        <div className="relative z-10 w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl">
                            {/* Drag handle + close */}
                            <div className="flex items-center justify-between px-5 pb-2 pt-3">
                                <div className="mx-auto h-1 w-10 rounded-full bg-gray-200" />
                            </div>
                            <button
                                onClick={() => setShowMobileProfile(false)}
                                className="absolute top-3 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
                            >
                                <X className="h-4 w-4 text-gray-600" />
                            </button>

                            {/* Profile sidebar content at fixed height */}
                            <div className="h-[82svh] p-4 pb-6">
                                <DirectorProfileSidebar user={selectedUser} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
