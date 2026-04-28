'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompanyProfileTab from '@/components/profile/company-profile-tab';
import PersonalProfileTab from '@/components/profile/personal-profile-tab';
import SettingsTab from '@/components/profile/settings-tab';
import SubscriptionTab from '@/components/profile/subscription-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import images from '@/constants/image';
import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ProfilePage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || '';
    const mustVerifyEmail = searchParams.get('mustVerifyEmail') === 'true';
    const [activeTab, setActiveTab] = useState<'personal' | 'company' | 'settings' | 'subscription'>('personal');

    // Read tab from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['personal', 'company', 'settings', 'subscription'].includes(tabParam)) {
            setActiveTab(tabParam as 'personal' | 'company' | 'settings' | 'subscription');
        }
    }, []);

    if (!user) return null;
    const auth = { user };

    return (
        <AppLayout>
            

            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                <div className="w-full h-full absolute z-[2] bg-[#031C5B]"></div>
                <div
                    className="relative z-[3] flex flex-1 rounded-4xl bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:py-2"
                    style={{
                        backgroundImage: `url(${images.uibg})`,
                    }}
                >
                    <div className="relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col overflow-y-auto page-transition">
                        {/* Header */}
                        <div className="px-4 pt-6 pb-4 lg:px-8 lg:pt-8 lg:pb-4 xl:px-12">
                            <div className="flex items-center justify-between animate-fadeInDown">
                                <div>
                                    <h1 className="text-[16px] leading-2 font-bold text-white sm:text-[18px] md:text-[20px] lg:text-[28px] lg:leading-8 lg:text-gray-800">
                                        Profile Management
                                    </h1>
                                    <p className="mt-1 text-[12px] leading-2 font-normal text-white/80 sm:text-[14px] lg:text-[16px] lg:text-gray-600">
                                        Manage your personal information, company details, and account settings
                                    </p>
                                </div>

                                {/* Profile Picture Preview */}
                                <div className="flex items-center space-x-3">
                                    <div className="relative h-14 w-14 rounded-full bg-[#D6E264] p-1 lg:h-16 lg:w-16">
                                        <img
                                            src={
                                                auth.user.profile_picture ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=6366f1&color=ffffff&size=200`
                                            }
                                            alt={`${auth.user.name}'s Profile`}
                                            className="h-full w-full rounded-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=6366f1&color=ffffff&size=200`;
                                            }}
                                        />
                                    </div>
                                    <div className="hidden lg:block">
                                        <h3 className="text-lg font-semibold text-gray-800">{auth.user.name}</h3>
                                        <p className="text-sm text-gray-600">{auth.user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <Tabs
                            value={activeTab}
                            onValueChange={(val) => setActiveTab(val as typeof activeTab)}
                            className="flex w-full flex-1 flex-col"
                        >
                            {/* Tab Navigation */}
                            <div className="px-4 lg:px-8 xl:px-12">
                                <TabsList className="mx-auto grid w-full max-w-2xl grid-cols-4 rounded-none border-b border-gray-200/30 bg-transparent p-0 h-auto">
                                    <TabsTrigger
                                        value="personal"
                                        className="rounded-none border-b-2 border-transparent px-1 py-2.5 text-[13px] font-normal text-gray-500 transition-colors data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none"
                                    >
                                        Personal Profile
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="company"
                                        className="rounded-none border-b-2 border-transparent px-1 py-2.5 text-[13px] font-normal text-gray-500 transition-colors data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none"
                                    >
                                        Company Profile
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="subscription"
                                        className="rounded-none border-b-2 border-transparent px-1 py-2.5 text-[13px] font-normal text-gray-500 transition-colors data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none"
                                    >
                                        Subscription
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="settings"
                                        className="rounded-none border-b-2 border-transparent px-1 py-2.5 text-[13px] font-normal text-gray-500 transition-colors data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none"
                                    >
                                        Settings
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Tab Content */}
                            <div className="px-4 lg:px-8 xl:px-12">
                                <TabsContent value="personal" className="mt-0 outline-none" tabIndex={-1}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key="personal"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        >
                                            <PersonalProfileTab user={auth.user} />
                                        </motion.div>
                                    </AnimatePresence>
                                </TabsContent>

                                <TabsContent value="company" className="mt-0 outline-none" tabIndex={-1}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key="company"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        >
                                            <CompanyProfileTab user={auth.user} />
                                        </motion.div>
                                    </AnimatePresence>
                                </TabsContent>

                                <TabsContent value="subscription" className="mt-0 outline-none" tabIndex={-1}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key="subscription"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        >
                                            <SubscriptionTab user={auth.user} />
                                        </motion.div>
                                    </AnimatePresence>
                                </TabsContent>

                                <TabsContent value="settings" className="mt-0 outline-none" tabIndex={-1}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key="settings"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        >
                                            <SettingsTab user={auth.user} mustVerifyEmail={mustVerifyEmail} status={status} />
                                        </motion.div>
                                    </AnimatePresence>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default function Page() { return <Suspense fallback={null}><ProfilePage /></Suspense>; }
