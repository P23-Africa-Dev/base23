'use client';

export const dynamic = 'force-dynamic';

import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/context/AuthContext';
import images from '@/constants/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Camera,
    Check,
    ChevronRight,
    Crown,
    Globe,
    Link2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Shield,
    Sparkles,
    Star,
    Users,
    Bell,
    Moon,
    Sun,
    Zap,
    Building2,
    Briefcase,
    CalendarDays,
    BadgeCheck,
    Eye,
    EyeOff,
} from 'lucide-react';
import { IoPerson } from 'react-icons/io5';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { MdOutlineWorkspacePremium } from 'react-icons/md';
import { SlSettings } from 'react-icons/sl';

/* ─────────────────────────── inner page (needs useSearchParams) ─────────── */

function ProfileInner() {
    const { user, subscription } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const activeTab = (params.get('tab') ?? 'personal') as
        | 'personal'
        | 'company'
        | 'subscription'
        | 'settings';

    const setTab = (t: string) => router.push(`/profile?tab=${t}`);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'GU';

    const tabs = [
        { id: 'personal', label: 'Personal Profile', icon: <IoPerson className="h-4 w-4" /> },
        { id: 'company', label: 'Company Profile', icon: <HiOutlineUserGroup className="h-4 w-4" /> },
        { id: 'subscription', label: 'Subscription', icon: <MdOutlineWorkspacePremium className="h-4 w-4" /> },
        { id: 'settings', label: 'Settings', icon: <SlSettings className="h-4 w-4" /> },
    ];

    return (
        <div className="relative min-h-screen">
            {/* Dark sidebar strip (matches app chrome) */}
            <div className="absolute z-[2] hidden h-full w-full bg-[#031C5B] lg:block" />

            <div
                className="relative z-[3] flex flex-1 flex-col bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl"
                style={{ backgroundImage: `url(${images.uibg})` }}
            >
                <div className="flex h-screen max-h-[96vh] flex-col overflow-hidden px-3 py-4 lg:px-8 lg:py-6">

                    {/* ── Profile header — shrink-0 so it never gets compressed ── */}
                    <div className="relative mb-6 shrink-0 overflow-hidden rounded-3xl bg-deepBlack px-6 py-7 lg:px-10">
                        {/* subtle texture */}
                        <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
                            style={{ backgroundImage: `url(${images.uibg})`, backgroundSize: 'cover' }} />

                        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-darkGreen/30 lg:h-28 lg:w-28">
                                    <Avatar className="h-full w-full rounded-2xl">
                                        <AvatarImage src={user?.profile_picture} className="object-cover" />
                                        <AvatarFallback className="rounded-2xl bg-darkBlue text-2xl font-bold text-darkGreen">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <button className="absolute -right-1.5 -bottom-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-darkGreen shadow-lg transition hover:bg-darkGreen/80">
                                    <Camera className="h-3.5 w-3.5 text-deepBlack" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                    <h1 className="text-xl font-extrabold text-white lg:text-2xl">
                                        {user?.name ?? 'Guest User'}
                                    </h1>
                                    {user?.email_verified_at && (
                                        <BadgeCheck className="h-5 w-5 shrink-0 text-darkGreen" />
                                    )}
                                    <Badge className="border-0 bg-darkGreen/20 text-[10px] font-semibold text-darkGreen">
                                        {subscription?.on_trial ? 'Trial' : subscription?.is_active ? 'Pro' : 'Member'}
                                    </Badge>
                                </div>
                                <p className="mt-0.5 text-sm text-white/60">{user?.position ?? 'Member'}</p>
                                <div className="mt-1 flex flex-wrap justify-center gap-3 sm:justify-start">
                                    {user?.company_name && (
                                        <span className="flex items-center gap-1 text-xs text-white/50">
                                            <Building2 className="h-3 w-3" /> {user.company_name}
                                        </span>
                                    )}
                                    {user?.country && (
                                        <span className="flex items-center gap-1 text-xs text-white/50">
                                            <MapPin className="h-3 w-3" /> {user.country}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats strip */}
                            <div className="flex shrink-0 items-center gap-6 rounded-2xl bg-white/5 px-5 py-3">
                                <Stat label="Connections" value="128" />
                                <div className="h-8 w-px bg-white/10" />
                                <Stat label="Referrals" value="34" />
                                <div className="h-8 w-px bg-white/10" />
                                <Stat label="Matches" value="12" />
                            </div>
                        </div>
                    </div>

                    {/* ── Tab bar — shrink-0 so it never gets compressed ── */}
                    <div className="no-scrollbar mb-5 flex shrink-0 gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-[0px_2px_12px_rgba(0,0,0,0.07)]">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all lg:text-[13px] ${
                                    activeTab === t.id
                                        ? 'bg-deepBlack text-white shadow-md'
                                        : 'text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab content — flex-1 + own scroll so header/tabs never move ── */}
                    <div className="no-scrollbar flex-1 overflow-y-auto">
                        {activeTab === 'personal' && <PersonalTab user={user} />}
                        {activeTab === 'company' && <CompanyTab user={user} />}
                        {activeTab === 'subscription' && <SubscriptionTab subscription={subscription} />}
                        {activeTab === 'settings' && <SettingsTab user={user} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PERSONAL PROFILE TAB
═══════════════════════════════════════════════════════════════════════════ */

function PersonalTab({ user }: { user: any }) {
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div className="flex flex-col gap-4">
                {/* Basic info */}
                <Section
                    title="Basic Information"
                    action={
                        editing ? (
                            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-full bg-darkGreen px-4 py-1.5 text-xs font-bold text-deepBlack transition hover:opacity-90">
                                {saved ? <Check className="h-3.5 w-3.5" /> : null}
                                {saved ? 'Saved!' : 'Save Changes'}
                            </button>
                        ) : (
                            <button onClick={() => setEditing(true)} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-deepBlack hover:text-deepBlack">
                                Edit
                            </button>
                        )
                    }
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Full Name" value={user?.name} icon={<IoPerson className="h-4 w-4" />} editing={editing} />
                        <Field label="Email Address" value={user?.email} icon={<Mail className="h-4 w-4" />} editing={editing} type="email" />
                        <Field label="Phone Number" value={user?.phone} icon={<Phone className="h-4 w-4" />} editing={editing} type="tel" />
                        <Field label="Country" value={user?.country} icon={<Globe className="h-4 w-4" />} editing={editing} />
                        <Field label="Position / Role" value={user?.position} icon={<Briefcase className="h-4 w-4" />} editing={editing} />
                        <Field label="LinkedIn URL" value={user?.linkedin} icon={<Link2 className="h-4 w-4" />} editing={editing} type="url" />
                    </div>
                </Section>

                {/* Goals */}
                <Section title="Goals & Bio">
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">What are your goals?</label>
                        {editing ? (
                            <textarea
                                defaultValue={user?.goals ?? ''}
                                rows={3}
                                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-darkBlue focus:ring-1 focus:ring-darkBlue"
                            />
                        ) : (
                            <p className="text-sm leading-relaxed text-gray-600">
                                {user?.goals ?? 'No goals set yet. Click Edit to add your goals.'}
                            </p>
                        )}
                    </div>
                </Section>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">
                {/* Skills */}
                <Section title="Great At">
                    <div className="flex flex-wrap gap-2">
                        {(user?.great_at ?? ['Sales Strategy', 'B2B Networking', 'Deal Closing']).map((s: string) => (
                            <TagPill key={s} label={s} />
                        ))}
                        {editing && <AddTagButton />}
                    </div>
                </Section>

                <Section title="Can Help With">
                    <div className="flex flex-wrap gap-2">
                        {(user?.can_help_with ?? ['Lead Generation', 'Market Entry', 'Partnerships']).map((s: string) => (
                            <TagPill key={s} label={s} color="green" />
                        ))}
                        {editing && <AddTagButton />}
                    </div>
                </Section>

                {/* Selected outcome */}
                <Section title="Selected Outcome">
                    <p className="text-sm text-gray-600">
                        {user?.selected_outcome ?? 'Not set'}
                    </p>
                </Section>

                {/* Member since */}
                <div className="flex items-center gap-3 rounded-2xl bg-deepBlack px-5 py-4">
                    <CalendarDays className="h-5 w-5 shrink-0 text-darkGreen" />
                    <div>
                        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">Member Since</p>
                        <p className="text-sm font-bold text-white">
                            {user?.created_at
                                ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY PROFILE TAB
═══════════════════════════════════════════════════════════════════════════ */

function CompanyTab({ user }: { user: any }) {
    const [editing, setEditing] = useState(false);

    return (
        <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-[1fr_300px]">
            {/* LEFT */}
            <div className="flex flex-col gap-4">
                {/* Company header card */}
                <div className="relative overflow-hidden rounded-3xl bg-darkBlue px-6 py-8">
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-48 opacity-10"
                        style={{ backgroundImage: `url(${images.referralPattern})`, backgroundSize: 'cover' }} />
                    <div className="relative flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-2 ring-white/20">
                            <Building2 className="h-8 w-8 text-darkGreen" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-white">
                                {user?.company_name ?? 'Your Company'}
                            </h2>
                            <p className="text-sm text-white/60">{user?.industry ?? 'Industry not set'}</p>
                        </div>
                    </div>
                </div>

                <Section
                    title="Company Details"
                    action={
                        <button
                            onClick={() => setEditing(!editing)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                editing
                                    ? 'bg-darkGreen text-deepBlack'
                                    : 'border border-gray-200 text-gray-600 hover:border-deepBlack hover:text-deepBlack'
                            }`}
                        >
                            {editing ? 'Save Changes' : 'Edit'}
                        </button>
                    }
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Company Name" value={user?.company_name} icon={<Building2 className="h-4 w-4" />} editing={editing} />
                        <Field label="Industry" value={user?.industry} icon={<Briefcase className="h-4 w-4" />} editing={editing} />
                        <Field label="Years in Operation" value={user?.years_of_operation} icon={<CalendarDays className="h-4 w-4" />} editing={editing} />
                        <Field label="Number of Employees" value={user?.number_of_employees} icon={<Users className="h-4 w-4" />} editing={editing} />
                    </div>
                    <div className="mt-4">
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Description</label>
                        {editing ? (
                            <textarea
                                defaultValue={user?.company_description ?? ''}
                                rows={4}
                                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-darkBlue focus:ring-1 focus:ring-darkBlue"
                            />
                        ) : (
                            <p className="text-sm leading-relaxed text-gray-600">
                                {user?.company_description ?? 'No description added yet.'}
                            </p>
                        )}
                    </div>
                </Section>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">
                <Section title="Categories">
                    <div className="flex flex-wrap gap-2">
                        {(user?.categories ? user.categories.split(',') : ['Technology', 'B2B', 'SaaS']).map((c: string) => (
                            <TagPill key={c} label={c.trim()} />
                        ))}
                    </div>
                </Section>

                {/* Company health score — decorative */}
                <div className="rounded-3xl bg-deepBlack p-5">
                    <p className="mb-4 text-xs font-semibold text-white/50 uppercase tracking-wide">Profile Completeness</p>
                    <div className="mb-2 flex items-end justify-between">
                        <span className="text-3xl font-extrabold text-darkGreen">
                            {calcCompleteness(user)}%
                        </span>
                        <Sparkles className="h-5 w-5 text-darkGreen/60" />
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-darkGreen transition-all duration-700"
                            style={{ width: `${calcCompleteness(user)}%` }}
                        />
                    </div>
                    <p className="mt-2 text-[11px] text-white/40">
                        Complete your profile to get better matches.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUBSCRIPTION TAB
═══════════════════════════════════════════════════════════════════════════ */

const PLAN_FEATURES = {
    free: ['5 Smart Matches / month', 'Basic Directory Access', 'Limited Messaging', 'Community Support'],
    pro: ['Unlimited Smart Matches', 'Full Directory Access', 'Priority Messaging', 'Deal Cards', 'Smart Match Profile', 'Dedicated Support', 'Advanced Analytics', 'Export Reports'],
};

function SubscriptionTab({ subscription }: { subscription: any }) {
    const isPro = subscription?.is_active && !subscription?.on_trial;
    const isTrial = subscription?.on_trial;

    return (
        <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div className="flex flex-col gap-4">
                {/* Current plan card */}
                <div className="relative overflow-hidden rounded-3xl bg-deepBlack px-6 py-7">
                    <div className="pointer-events-none absolute right-6 top-6 opacity-10">
                        <Crown className="h-24 w-24 text-darkGreen" />
                    </div>
                    <div className="relative">
                        <div className="mb-3 flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                isPro ? 'bg-darkGreen/20 text-darkGreen' : isTrial ? 'bg-yellow-400/20 text-yellow-300' : 'bg-white/10 text-white/60'
                            }`}>
                                {isPro ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                                {isPro ? 'Pro Plan' : isTrial ? 'Trial Active' : 'Free Plan'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white">
                            {isPro ? 'NOEL Pro' : isTrial ? 'Free Trial' : 'Free Member'}
                        </h2>
                        {isTrial && subscription?.trial_days_remaining != null && (
                            <p className="mt-1 text-sm text-yellow-300/80">
                                {subscription.trial_days_remaining} days remaining in trial
                            </p>
                        )}
                        {isPro && subscription?.current_period_end && (
                            <p className="mt-1 text-sm text-white/50">
                                Renews {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        )}
                        {!isPro && (
                            <button className="mt-4 flex items-center gap-2 rounded-full bg-darkGreen px-6 py-2.5 text-sm font-bold text-deepBlack transition hover:opacity-90">
                                <Zap className="h-4 w-4" /> Upgrade to Pro
                            </button>
                        )}
                        {isPro && (
                            <button className="mt-4 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white">
                                Manage Plan
                            </button>
                        )}
                    </div>
                </div>

                {/* Features comparison */}
                <Section title="Plan Features">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {PLAN_FEATURES.pro.map((f) => {
                            const inFree = PLAN_FEATURES.free.some((ff) => ff === f);
                            const active = isPro || inFree;
                            return (
                                <div key={f} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${active ? 'bg-darkGreen/8' : 'bg-gray-50 opacity-50'}`}>
                                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${active ? 'bg-darkGreen' : 'bg-gray-200'}`}>
                                        <Check className="h-3 w-3 text-deepBlack" />
                                    </div>
                                    <span className="text-sm text-gray-700">{f}</span>
                                </div>
                            );
                        })}
                    </div>
                </Section>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">
                {/* Usage */}
                <Section title="Usage This Month">
                    <div className="space-y-4">
                        <UsageStat label="Smart Matches" used={isPro ? 47 : 5} total={isPro ? null : 5} />
                        <UsageStat label="Messages Sent" used={isPro ? 124 : 12} total={isPro ? null : 20} />
                        <UsageStat label="Referrals Made" used={8} total={isPro ? null : 10} />
                    </div>
                </Section>

                {/* Billing */}
                <Section title="Billing">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-14 items-center justify-center rounded-lg bg-white shadow-sm">
                                    <img src={images.visa} className="h-4 object-contain" alt="Visa" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-700">Visa •••• 4242</p>
                                    <p className="text-[11px] text-gray-400">Expires 12/26</p>
                                </div>
                            </div>
                            <Badge className="border-0 bg-darkGreen/15 text-[10px] text-darkGreen">Default</Badge>
                        </div>
                        <button className="w-full rounded-xl border border-dashed border-gray-200 py-2.5 text-xs font-semibold text-gray-400 transition hover:border-gray-400 hover:text-gray-600">
                            + Add Payment Method
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
═══════════════════════════════════════════════════════════════════════════ */

function SettingsTab({ user }: { user: any }) {
    const [showPass, setShowPass] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [notifMatch, setNotifMatch] = useState(true);
    const [notifMsg, setNotifMsg] = useState(true);
    const [notifDeals, setNotifDeals] = useState(false);

    return (
        <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-2">
            {/* Password & Security */}
            <Section title="Password & Security" icon={<Lock className="h-4 w-4 text-darkGreen" />}>
                <div className="space-y-3">
                    <div className="relative">
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-darkBlue focus:ring-1 focus:ring-darkBlue"
                            />
                            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-darkBlue focus:ring-1 focus:ring-darkBlue" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-darkBlue focus:ring-1 focus:ring-darkBlue" />
                    </div>
                    <button className="mt-1 w-full rounded-full bg-deepBlack py-2.5 text-sm font-bold text-white transition hover:bg-darkBlue">
                        Update Password
                    </button>
                </div>
            </Section>

            {/* Notifications */}
            <Section title="Notifications" icon={<Bell className="h-4 w-4 text-darkGreen" />}>
                <div className="space-y-3">
                    <ToggleRow
                        label="Smart Match Alerts"
                        desc="Get notified when a new match is found"
                        value={notifMatch}
                        onChange={setNotifMatch}
                    />
                    <ToggleRow
                        label="New Messages"
                        desc="Receive alerts for incoming messages"
                        value={notifMsg}
                        onChange={setNotifMsg}
                    />
                    <ToggleRow
                        label="Deal Card Updates"
                        desc="Notifications for deal card activity"
                        value={notifDeals}
                        onChange={setNotifDeals}
                    />
                </div>
            </Section>

            {/* Appearance */}
            <Section title="Appearance" icon={<Sun className="h-4 w-4 text-darkGreen" />}>
                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                        <div>
                            <p className="text-sm font-semibold text-gray-700">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                            <p className="text-xs text-gray-400">Toggle the app theme</p>
                        </div>
                    </div>
                    <Toggle value={darkMode} onChange={setDarkMode} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    {['Compact', 'Comfortable'].map((density) => (
                        <button key={density} className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${density === 'Comfortable' ? 'border-deepBlack bg-deepBlack text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                            {density}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Privacy & Danger zone */}
            <Section title="Privacy & Account" icon={<Shield className="h-4 w-4 text-darkGreen" />}>
                <div className="space-y-2">
                    {[
                        { label: 'Blocked Users', desc: 'Manage who you\'ve blocked', icon: <Shield className="h-4 w-4 text-gray-400" /> },
                        { label: 'Privacy Settings', desc: 'Control your visibility', icon: <Eye className="h-4 w-4 text-gray-400" /> },
                        { label: 'Connected Apps', desc: 'Third-party integrations', icon: <Globe className="h-4 w-4 text-gray-400" /> },
                    ].map((item) => (
                        <button key={item.label} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-50">
                            {item.icon}
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                                <p className="text-xs text-gray-400">{item.desc}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300" />
                        </button>
                    ))}
                    <div className="mt-2 border-t border-gray-100 pt-3">
                        <button className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-50 hover:text-red-500">
                            Delete Account
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function Section({ title, children, action, icon }: {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)] lg:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-sm font-extrabold text-deepBlack lg:text-[15px]">{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function Field({ label, value, icon, editing, type = 'text' }: {
    label: string;
    value?: string | null;
    icon: React.ReactNode;
    editing: boolean;
    type?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
            {editing ? (
                <input
                    type={type}
                    defaultValue={value ?? ''}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-darkBlue focus:ring-1 focus:ring-darkBlue"
                />
            ) : (
                <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3.5 py-2.5">
                    <span className="shrink-0 text-gray-400">{icon}</span>
                    <span className="text-sm text-gray-700">{value ?? <span className="text-gray-300">Not set</span>}</span>
                </div>
            )}
        </div>
    );
}

function TagPill({ label, color = 'blue' }: { label: string; color?: 'blue' | 'green' }) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            color === 'green'
                ? 'bg-darkGreen/12 text-darkBlue'
                : 'bg-deepBlack/8 text-deepBlack'
        }`}>
            {label}
        </span>
    );
}

function AddTagButton() {
    return (
        <button className="inline-flex items-center rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-400 transition hover:border-gray-500 hover:text-gray-600">
            + Add
        </button>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-center">
            <p className="text-lg font-extrabold text-darkGreen">{value}</p>
            <p className="text-[10px] text-white/40">{label}</p>
        </div>
    );
}

function UsageStat({ label, used, total }: { label: string; used: number; total: number | null }) {
    const pct = total ? Math.min((used / total) * 100, 100) : null;
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600">{label}</span>
                <span className="text-gray-400">{total ? `${used} / ${total}` : `${used} used`}</span>
            </div>
            {total && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                        className={`h-full rounded-full transition-all ${pct && pct >= 100 ? 'bg-red-400' : 'bg-darkGreen'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
        </div>
    );
}

function ToggleRow({ label, desc, value, onChange }: {
    label: string;
    desc: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <div>
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <Toggle value={value} onChange={onChange} />
        </div>
    );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                value ? 'bg-darkGreen' : 'bg-gray-200'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

function calcCompleteness(user: any): number {
    if (!user) return 10;
    const fields = ['name', 'email', 'phone', 'country', 'position', 'company_name', 'industry', 'company_description', 'linkedin', 'goals'];
    const filled = fields.filter((f) => user[f]).length;
    return Math.round((filled / fields.length) * 100);
}

/* ─────────────────────────── default export (with Suspense) ─────────────── */

export default function ProfilePage() {
    return (
        <AppLayout>
            <Suspense fallback={null}>
                <ProfileInner />
            </Suspense>
        </AppLayout>
    );
}
