'use client';

export const dynamic = 'force-dynamic';

import images from '@/constants/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { dummyDirectorLeads } from '@/dummyDatas/director';
import { dummyDirectorList } from '@/dummyDatas/director';
import DirectorProfileSidebar from '@/components/sidebars/director-profile-sidebar';
import DirectorListCard from '@/components/cards/directory/director-list-card';
import { DirectorLeadsCard } from '@/components/cards/directory/director-leads-card';

export default function DirectorPage() {
    const [selectedUser, setSelectedUser] = useState(dummyDirectorLeads[0]);

    return (
        <AppLayout>
            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                <div className="absolute z-[2] hidden h-full w-full lg:block bg-[#031C5B] dark:lg:bg-gray-900"></div>
                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{ backgroundImage: `url(${images.uibg})` }}
                >
                    <div className="relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col overflow-hidden px-2 pb-1 lg:py-0 lg:pr-4 lg:pl-7 xl:pr-2 xl:pl-16">
                        <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] lg:p-4 xl:p-0 page-transition">

                            {/* LEFT COLUMN */}
                            <div className="flex h-full flex-col overflow-hidden pb-4 lg:pr-4 lg:pl-3">
                                {/* Header */}
                                <div className="rounded-md bg-[#0B2B33] lg:bg-transparent">
                                    <div className="sticky top-0 z-10 flex items-center justify-between overflow-hidden border-b-0 bg-transparent px-3 pt-4 pb-3 lg:px-0">
                                        
                                        {/* Desktop Heading */}
                                        <h2 className="hidden text-[12px] leading-2 font-normal text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:block lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Find your Next{' '}
                                            <span className="tex-white text-base font-extrabold sm:text-xl lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                Sales Rep
                                            </span>
                                        </h2>

                                        {/* Mobile Heading */}
                                        <h2 className="-mt-1 ml-5 w-[120px] text-[9.8px] leading-3 font-light text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:ml-0 lg:hidden lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Find your Next{' '}
                                            <span className="tex-white text-[13px] font-extrabold sm:text-xl md:text-sm lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                Sales Rep
                                            </span>
                                        </h2>

                                        <div className="lg:pace-x-2 flex w-full items-center justify-end space-x-0 lg:items-start lg:gap-3">
                                            <div className="relative w-full max-w-[280px]">
                                                <div className="relative cursor-pointer">
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        className="w-full rounded-full border-0 bg-[#D3F1E729] px-4 py-2.5 pr-10 text-xs text-white italic placeholder:text-[11px] placeholder:font-light placeholder:text-white focus:ring-0 focus:outline-none lg:bg-[#27E6A729] lg:px-4 lg:py-2.5 lg:pl-10 lg:text-deepBlack lg:placeholder:text-sm lg:placeholder:text-primary/80"
                                                    />
                                                    <button className="absolute top-1/2 right-4 -translate-y-1/2">
                                                        <img src={images.desktopSearch} className="h-5 w-5" alt="Search" />
                                                    </button>
                                                </div>
                                            </div>
                                            <button className="hidden lg:flex items-center justify-center p-2">
                                                <img src={images.preferenceHorizontal} className="h-6 w-6" alt="Filter" />
                                            </button>
                                            <button className="hidden lg:flex items-center justify-center p-2 rounded-full bg-[#0B1727]">
                                                <img src={images.refreshNew} className="h-4 w-4" alt="Refresh" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <Tabs defaultValue="all" className="flex flex-1 flex-col overflow-hidden lg:w-full">
                                    <TabsList className="mx-auto mb-4 no-scrollbar grid w-[95%] shrink-0 grid-cols-3 gap-5 overflow-x-auto rounded-full bg-[#F1EEEE] px-3 shadow-[0px_2px_5px_-1px_rgba(0,0,0,0.2),0px_2px_5px_-1px_rgba(0,0,0,0.2)] md:overflow-hidden lg:mx-0 lg:mb-2 lg:w-full lg:max-w-xl lg:gap-2 lg:rounded-none lg:bg-white lg:px-0 lg:shadow-none">
                                        <TabsTrigger
                                            value="all"
                                            className="-mt-0.5 -ml-1 rounded-full border-0 px-10 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            All Directory
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="shortlisted"
                                            className="-mx-2.5 -mt-0.5 rounded-full border-0 px-9.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Shortlisted
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="pipeline"
                                            className="-mx-2.5 -mt-0.5 rounded-full border-0 px-10.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:mx-0 lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Hire Pipeline
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="no-scrollbar flex-1 overflow-y-auto rounded-2xl bg-deepBlack pt-2 lg:bg-transparent lg:pt-2">
                                        <div className="space-y-5 pb-10">
                                            {/* Top Leads Horizontal Grid */}
                                            <div className="hidden grid-cols-4 gap-3 lg:grid">
                                                {dummyDirectorLeads.map((user) => (
                                                    <div key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer">
                                                        <DirectorLeadsCard user={user} isSelected={selectedUser.id === user.id} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* List Cards */}
                                            <div className="flex flex-col gap-3">
                                                {dummyDirectorList.map((user) => (
                                                    <div key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer">
                                                        <DirectorListCard user={user} isSelected={selectedUser.id === user.id} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="shortlisted">
                                        <div className="flex items-center justify-center h-40 text-gray-500">No shortlisted candidates yet.</div>
                                    </TabsContent>
                                    <TabsContent value="pipeline">
                                        <div className="flex items-center justify-center h-40 text-gray-500">No candidates in pipeline.</div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="hidden lg:flex lg:py-2 lg:pr-1">
                                <DirectorProfileSidebar user={selectedUser} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
