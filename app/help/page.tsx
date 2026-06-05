'use client';

export const dynamic = 'force-dynamic';

import AppLayout from '@/layouts/app-layout';
import images from '@/constants/image';
import { useState } from 'react';
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    HelpCircle,
    Mail,
    MessageCircle,
    Search,
    Sparkles,
    Users,
    Zap,
    ShieldCheck,
    CreditCard,
    Settings,
    UserCircle,
} from 'lucide-react';

/* ─── Types ─── */
type FAQItem = { q: string; a: string };
type FAQSection = { id: string; icon: React.ReactNode; title: string; items: FAQItem[] };

/* ─── Data ─── */
const FAQ_SECTIONS: FAQSection[] = [
    {
        id: 'getting-started',
        icon: <Zap className="h-4 w-4" />,
        title: 'Getting Started',
        items: [
            {
                q: 'What is NOEL (BASE 23)?',
                a: 'NOEL is a business referral network that intelligently connects professionals, sales reps, and business owners. It uses Smart Match technology to surface the right people for the right opportunities — saving you hours of irrelevant networking.',
            },
            {
                q: 'How do I set up my Smart Match profile?',
                a: 'Navigate to the Match page and click the "Smart Match Profile Setup" card on the right sidebar. You\'ll be guided through 5 short steps covering your needs, preferred industry, business level, and tags. It takes about 2 minutes.',
            },
            {
                q: 'How do I complete my profile?',
                a: 'Go to your Profile page (click your name in the sidebar). Fill in your Personal Profile tab — name, position, location, LinkedIn, goals, and skills. A complete profile increases your match quality significantly.',
            },
        ],
    },
    {
        id: 'smart-match',
        icon: <Sparkles className="h-4 w-4" />,
        title: 'Smart Match',
        items: [
            {
                q: 'How does Smart Match work?',
                a: 'Smart Match analyses your profile preferences — what you need, your industry, business level, and interest tags — and compares them against all other members to compute a compatibility percentage. The higher the score, the more aligned the opportunity.',
            },
            {
                q: 'Why am I not getting matches?',
                a: 'Make sure your Smart Match Profile is fully set up with all 5 steps completed. Also ensure your Personal Profile is as complete as possible. Incomplete profiles receive fewer and lower-quality matches.',
            },
            {
                q: 'Can I update my Smart Match preferences?',
                a: 'Yes — open the Match page, click the purple card in the sidebar, and choose "Update Preferences". Your previous selections are pre-filled so you only need to change what\'s relevant.',
            },
        ],
    },
    {
        id: 'directory',
        icon: <Users className="h-4 w-4" />,
        title: 'Directory & Connections',
        items: [
            {
                q: 'How do I find a specific type of sales rep?',
                a: 'Use the Directory page (the search icon in the sidebar). You can search by name, filter by industry, or browse the Shortlisted and Hire Pipeline tabs to track candidates you\'ve saved.',
            },
            {
                q: 'What does "Shortlisting" someone do?',
                a: 'Shortlisting saves a candidate to your Shortlisted tab in the Directory for easy follow-up. They are not notified when you shortlist them.',
            },
            {
                q: 'How do I send a connection request?',
                a: 'Open a user\'s profile from the Directory or from a Smart Match result and click "Connect". The other user will receive a notification and can accept or decline.',
            },
        ],
    },
    {
        id: 'messaging',
        icon: <MessageCircle className="h-4 w-4" />,
        title: 'Messaging',
        items: [
            {
                q: 'Can I message anyone on the platform?',
                a: 'Free members have a monthly messaging limit. Pro members have unlimited messaging. You can message any connected user directly from the Messages page.',
            },
            {
                q: 'How do I archive or delete a conversation?',
                a: 'Open the conversation, tap the three-dot menu at the top right, and select Archive or Delete. Archived chats can be found in the Archived section of your message list.',
            },
        ],
    },
    {
        id: 'subscription',
        icon: <CreditCard className="h-4 w-4" />,
        title: 'Subscription & Billing',
        items: [
            {
                q: 'What is included in the Pro plan?',
                a: 'Pro gives you unlimited Smart Matches, full Directory access, priority messaging, Deal Cards, advanced analytics, export reports, and dedicated support.',
            },
            {
                q: 'How do I upgrade to Pro?',
                a: 'Go to Profile → Subscription tab and click "Upgrade to Pro". You\'ll be taken through the payment flow. Upgrades take effect immediately.',
            },
            {
                q: 'Can I cancel my subscription at any time?',
                a: 'Yes. Go to Profile → Subscription → Manage Plan. Your access continues until the end of the current billing period — you won\'t be charged again after cancellation.',
            },
            {
                q: 'What happens when my trial ends?',
                a: 'When your free trial expires, your account automatically moves to the Free plan. You won\'t lose any data, but Pro-only features will be locked until you upgrade.',
            },
        ],
    },
    {
        id: 'account',
        icon: <UserCircle className="h-4 w-4" />,
        title: 'Account & Settings',
        items: [
            {
                q: 'How do I change my password?',
                a: 'Go to Profile → Settings tab → Password & Security. Enter your current password and your new password, then click Update Password.',
            },
            {
                q: 'How do I block another user?',
                a: 'Open the user\'s profile or conversation. Use the three-dot menu and select Block. You can manage blocked users under Profile → Settings → Privacy & Account → Blocked Users.',
            },
            {
                q: 'How do I delete my account?',
                a: 'Go to Profile → Settings → Privacy & Account → Delete Account. This action is permanent and will remove all your data, connections, and matches. Make sure to export any data you need beforehand.',
            },
        ],
    },
    {
        id: 'security',
        icon: <ShieldCheck className="h-4 w-4" />,
        title: 'Privacy & Security',
        items: [
            {
                q: 'Who can see my profile?',
                a: 'By default, your profile is visible to all NOEL members. You can control your visibility under Profile → Settings → Privacy & Account → Privacy Settings.',
            },
            {
                q: 'Is my payment information safe?',
                a: 'Yes. We use Stripe for all payment processing. Your card details are never stored on our servers — only a secure token is kept for recurring billing.',
            },
        ],
    },
];

const QUICK_LINKS = [
    { label: 'Set up Smart Match Profile', href: '/referrals', icon: <Sparkles className="h-4 w-4" /> },
    { label: 'Browse the Directory', href: '/director', icon: <Users className="h-4 w-4" /> },
    { label: 'Manage Subscription', href: '/profile?tab=subscription', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Account Settings', href: '/profile?tab=settings', icon: <Settings className="h-4 w-4" /> },
];

/* ─── Page ─── */
export default function HelpPage() {
    const [search, setSearch] = useState('');
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const toggle = (key: string) =>
        setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

    const query = search.toLowerCase().trim();
    const filtered: FAQSection[] = query
        ? FAQ_SECTIONS.map((s) => ({
              ...s,
              items: s.items.filter(
                  (i) =>
                      i.q.toLowerCase().includes(query) ||
                      i.a.toLowerCase().includes(query),
              ),
          })).filter((s) => s.items.length > 0)
        : FAQ_SECTIONS;

    return (
        <AppLayout>
            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                <div className="absolute z-[2] hidden h-full w-full bg-[#031C5B] lg:block" />
                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{ backgroundImage: `url(${images.uibg})` }}
                >
                    <div className="flex h-screen max-h-[96vh] w-full flex-col overflow-hidden px-3 py-4 lg:px-8 lg:py-6">

                        {/* ── Page header ── */}
                        <div className="mb-5 shrink-0">
                            <div className="relative overflow-hidden rounded-3xl bg-deepBlack px-7 py-8 lg:px-10">
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                                    style={{ backgroundImage: `url(${images.uibg})`, backgroundSize: 'cover' }}
                                />
                                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <HelpCircle className="h-5 w-5 text-darkGreen" />
                                            <span className="text-xs font-semibold uppercase tracking-widest text-darkGreen">
                                                Help Centre
                                            </span>
                                        </div>
                                        <h1 className="text-2xl font-extrabold text-white lg:text-3xl">
                                            How can we help you?
                                        </h1>
                                        <p className="mt-1.5 text-sm text-white/50">
                                            Search the docs, browse FAQs, or reach out directly.
                                        </p>
                                    </div>

                                    {/* Search */}
                                    <div className="relative w-full max-w-xs lg:max-w-sm">
                                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" />
                                        <input
                                            type="text"
                                            placeholder="Search for answers…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full rounded-full border-0 bg-white/10 py-3 pr-5 pl-11 text-sm text-white placeholder:text-white/40 focus:bg-white/15 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Scrollable body ── */}
                        <div className="no-scrollbar flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-5 pb-10 lg:grid-cols-[1fr_280px]">

                                {/* ── LEFT: FAQ sections ── */}
                                <div className="flex flex-col gap-4">
                                    {filtered.length === 0 && (
                                        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white py-16 text-center shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
                                            <BookOpen className="h-10 w-10 text-gray-200" />
                                            <p className="text-sm font-semibold text-gray-400">No results for "{search}"</p>
                                            <p className="text-xs text-gray-300">Try a different keyword or browse below</p>
                                        </div>
                                    )}

                                    {filtered.map((section) => (
                                        <div
                                            key={section.id}
                                            className="overflow-hidden rounded-3xl bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
                                        >
                                            {/* Section header */}
                                            <div className="flex items-center gap-2.5 border-b border-gray-50 px-6 py-4">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-deepBlack text-darkGreen">
                                                    {section.icon}
                                                </span>
                                                <h2 className="text-sm font-extrabold text-deepBlack lg:text-[15px]">
                                                    {section.title}
                                                </h2>
                                            </div>

                                            {/* FAQ items */}
                                            <div className="divide-y divide-gray-50">
                                                {section.items.map((item, idx) => {
                                                    const key = `${section.id}-${idx}`;
                                                    const isOpen = !!openItems[key];
                                                    return (
                                                        <div key={key}>
                                                            <button
                                                                onClick={() => toggle(key)}
                                                                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-gray-50/70"
                                                            >
                                                                <span className="text-sm font-semibold text-gray-700">
                                                                    {item.q}
                                                                </span>
                                                                <ChevronDown
                                                                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                                                                        isOpen ? 'rotate-180' : ''
                                                                    }`}
                                                                />
                                                            </button>
                                                            {isOpen && (
                                                                <div className="px-6 pb-5">
                                                                    <p className="text-sm leading-relaxed text-gray-500">
                                                                        {item.a}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── RIGHT sidebar ── */}
                                <div className="flex flex-col gap-4">
                                    {/* Quick links */}
                                    <div className="rounded-3xl bg-white p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
                                        <h3 className="mb-4 text-sm font-extrabold text-deepBlack">Quick Links</h3>
                                        <div className="flex flex-col gap-1">
                                            {QUICK_LINKS.map((l) => (
                                                <a
                                                    key={l.label}
                                                    href={l.href}
                                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-deepBlack"
                                                >
                                                    <span className="text-darkGreen">{l.icon}</span>
                                                    {l.label}
                                                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-gray-300" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="overflow-hidden rounded-3xl bg-deepBlack p-5">
                                        <div className="pointer-events-none absolute inset-0 opacity-5"
                                            style={{ backgroundImage: `url(${images.uibg})`, backgroundSize: 'cover' }} />
                                        <h3 className="mb-1 text-sm font-extrabold text-white">Still need help?</h3>
                                        <p className="mb-4 text-xs text-white/50">
                                            Our support team typically responds within 24 hours.
                                        </p>
                                        <a
                                            href="mailto:support@base23.com"
                                            className="flex items-center gap-2 rounded-full bg-darkGreen px-4 py-2.5 text-xs font-bold text-deepBlack transition hover:opacity-90"
                                        >
                                            <Mail className="h-3.5 w-3.5" />
                                            Email Support
                                        </a>
                                        <a
                                            href="#"
                                            className="mt-2 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            Live Chat
                                            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                                        </a>
                                    </div>

                                    {/* Docs */}
                                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
                                        <div className="mb-3 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-darkGreen" />
                                            <h3 className="text-sm font-extrabold text-deepBlack">Documentation</h3>
                                        </div>
                                        <p className="mb-3 text-xs leading-relaxed text-gray-400">
                                            Detailed guides on every feature — Smart Match, Deal Cards, Directory, and more.
                                        </p>
                                        <a
                                            href="#"
                                            className="flex items-center gap-1.5 text-xs font-bold text-darkBlue transition hover:text-deepBlack"
                                        >
                                            Browse Docs <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
