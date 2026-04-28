// components/leads/LeadFullProfilePanel.tsx
import images from '@/constants/image';
import { MapPin, Share2, Star } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { useState } from 'react';
import { LeadSidebarProfile } from './LeadsSidebar';

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

// Format date to readable format
function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not Specified';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
        return dateString;
    }
}

// Helper to check if a social link exists
function hasSocialLink(url: string | undefined): boolean {
    return !!(url && url.trim() !== '');
}

type Props = {
    data: LeadSidebarProfile;
    onClose: () => void;
};

export function LeadFullProfilePanel({ data, onClose }: Props) {
    const [showShareToast, setShowShareToast] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: data.name,
            text: `Check out ${data.name} - ${data.title}\n${data.bio}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                const shareText = `${data.name} - ${data.title}\n${data.email}\n${data.phone}\n${window.location.href}`;
                await navigator.clipboard.writeText(shareText);
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="h-full w-full overflow-y-scroll rounded-3xl bg-white pl-2 shadow-lg md:flex md:flex-row md:overflow-hidden md:p-4">
            {/* Share Toast */}
            {showShareToast && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
                    Copied to clipboard!
                </div>
            )}
            {/* Left Column - User Profile */}
            <div className="no-scrollbar flex w-full flex-col overflow-y-auto rounded-l-3xl bg-transparent py-4 pl-4 shadow-none md:h-auto md:w-[43%] md:overflow-hidden md:bg-[#A7D5DD] md:py-0 md:pl-6 md:shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]">
                {/***************************** Top Area */}
                <div className="mt-1 flex items-start gap-x-3 pr-6 text-center md:mt-0 md:flex-col md:items-center md:gap-x-0">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#325A64] via-[#325A64] to-[#AC7CEE] p-1 shadow-[3px_5px_4px_2px_rgba(0,0,0,0.25),3px_2px_4px_3px_rgba(0,0,0,0.25)] md:mt-10 md:h-28 md:w-28 lg:h-42 lg:w-42">
                        <div
                            // style={{
                            //     backgroundImage: `url(${images.man1})`,
                            // }}
                            className="h-17 w-17 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat md:h-25 md:w-25 lg:h-40 lg:w-40"
                        ></div>
                    </div>

                    <div className="flex flex-col items-start justify-start md:items-center md:justify-center">
                        {/* Headings */}

                        <div className="mt-2 text-left text-darkBlue md:mb-2 md:space-y-0 md:text-center lg:mt-10">
                            <h1 className="text-[12px] leading-3 font-extrabold md:text-base lg:max-w-[165px] lg:text-xl lg:leading-4.5">
                                {formatStringData(data.name, 'Unknown User')}
                            </h1>
                            <p className="mt-1 pr-8 text-[9.5px] leading-3 font-normal md:pr-0 md:text-xs lg:text-sm">
                                {formatStringData(data.title, 'Position Not Specified')}
                            </p>
                        </div>

                        {/* Descriptions */}

                        <p className="mt-1 pr-6 text-left text-[8.2px] leading-3 font-medium text-darkBlue md:mt-1.5 md:pr-0 md:text-center md:text-xs md:leading-4 lg:px-8">
                            {formatStringData(data.topGoal, 'Goals Not Specified')}
                        </p>

                        <div className="hidden items-center space-x-2 md:mt-4 md:flex">
                            <p className="text-base font-bold text-darkBlue underline">{data.rating ? Number(data.rating).toFixed(1) : '0.0'}</p>
                            <Star className="h-5 w-5 fill-[#978FED] text-[#978FED]" />
                        </div>
                    </div>
                </div>
                {/***************************** Bottom Area */}
                <div className="mt-8 md:mt-14 md:mb-26">
                    <div className="w-full space-y-2 text-left">
                        <h5 className="text-xs font-bold text-darkBlue lg:text-[13px]">
                            Base Location
                            <span className="block text-[10.5px] font-normal lg:text-[11.5px]">{formatStringData(data.baseLocation, 'Location Not Specified')}</span>
                        </h5>
                        <h5 className="text-xs font-bold text-darkBlue">
                            Operates In
                            <span className="block text-[10.5px] font-normal lg:text-[11.5px]">{formatStringData(data.operatesIn, 'Location Not Specified')}</span>
                        </h5>
                    </div>
                    <div className="mt-4 flex w-full items-start space-x-2">
                        <button className="flex h-9 w-9 items-center justify-center gap-2 rounded-full bg-darkBlue p-2 whitespace-nowrap text-white shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] lg:h-9 lg:w-9">
                            <img src={images.userMailVoice} className="h-5 w-6 lg:h-5 lg:w-5" alt="" />
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center gap-2 rounded-full bg-darkBlue p-2 whitespace-nowrap text-white shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] lg:h-9 lg:w-9">
                            <img src={images.userMessage} className="h-5 w-6 lg:h-5 lg:w-5" alt="" />
                        </button>
                        <button
                            onClick={handleShare}
                            title="Share profile"
                            className="flex h-9 w-9 items-center justify-center gap-2 rounded-full bg-darkBlue p-2 whitespace-nowrap text-white shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] hover:bg-[#2a5a6b] transition-colors lg:h-9 lg:w-9"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>

                        <button className="-mr-4 flex w-[40%] items-center justify-center gap-2 rounded-full bg-darkBlue px-2 py-2.5 text-[9px] font-semibold whitespace-nowrap text-[#D7F6EC] shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] md:py-3.5 lg:-mr-0 lg:w-fit">
                            Request Contact
                        </button>
                    </div>
                </div>
            </div>
            {/* Right Column - Detailed Info */}
            <div className="bio-info-scrollbar w-full overflow-y-auto p-3 md:max-h-max md:w-[57%] md:p-6">
                <div className="">
                    {/* Bio Section */}
                    <div className="text-darkBlue">
                        <h2 className="text-sm font-extrabold lg:text-base">Bio</h2>
                        <p className="mt-1 text-[9.6px] font-medium lg:text-[11px]">{formatStringData(data.bio, 'No Bio Available')}</p>
                    </div>

                    {/* Contact Information */}
                    <div className="mt-5 rounded-xl bg-[#F5F7FA] p-4">
                        <h3 className="text-xs font-bold text-darkBlue lg:text-sm mb-3">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-y-3 text-[10px] text-darkBlue lg:text-[11px]">
                            <div>
                                <p className="font-bold">Email</p>
                                <a href={`mailto:${data.email}`} className="font-normal text-blue-600 hover:underline break-all">
                                    {data.email || 'Not Specified'}
                                </a>
                            </div>
                            <div>
                                <p className="font-bold">Phone</p>
                                <a href={`tel:${data.phone}`} className="font-normal text-blue-600 hover:underline">
                                    {data.phone || 'Not Specified'}
                                </a>
                            </div>
                            {data.companyName && (
                                <div className="col-span-2">
                                    <p className="font-bold">Company Name</p>
                                    <p className="font-normal">{data.companyName}</p>
                                </div>
                            )}
                            {data.address && (
                                <div className="col-span-2">
                                    <p className="font-bold flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Address
                                    </p>
                                    <p className="font-normal">{data.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    {(hasSocialLink(data.linkedin) || hasSocialLink(data.twitter) || hasSocialLink(data.facebook) || hasSocialLink(data.instagram)) && (
                        <div className="mt-4 rounded-xl bg-[#F5F7FA] p-4">
                            <h3 className="text-xs font-bold text-darkBlue lg:text-sm mb-3">Social Profiles</h3>
                            <div className="flex flex-wrap gap-3">
                                {hasSocialLink(data.linkedin) && (
                                    <a
                                        href={data.linkedin?.startsWith('http') ? data.linkedin : `https://linkedin.com/in/${data.linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg bg-[#0077B5] px-3 py-2 text-white text-[10px] hover:opacity-80 transition-opacity"
                                    >
                                        <FaLinkedin className="h-4 w-4" />
                                        <span>LinkedIn</span>
                                    </a>
                                )}
                                {hasSocialLink(data.twitter) && (
                                    <a
                                        href={data.twitter?.startsWith('http') ? data.twitter : `https://twitter.com/${data.twitter?.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg bg-[#1DA1F2] px-3 py-2 text-white text-[10px] hover:opacity-80 transition-opacity"
                                    >
                                        <FaTwitter className="h-4 w-4" />
                                        <span>Twitter</span>
                                    </a>
                                )}
                                {hasSocialLink(data.facebook) && (
                                    <a
                                        href={data.facebook?.startsWith('http') ? data.facebook : `https://facebook.com/${data.facebook}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-3 py-2 text-white text-[10px] hover:opacity-80 transition-opacity"
                                    >
                                        <FaFacebook className="h-4 w-4" />
                                        <span>Facebook</span>
                                    </a>
                                )}
                                {hasSocialLink(data.instagram) && (
                                    <a
                                        href={data.instagram?.startsWith('http') ? data.instagram : `https://instagram.com/${data.instagram?.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] px-3 py-2 text-white text-[10px] hover:opacity-80 transition-opacity"
                                    >
                                        <FaInstagram className="h-4 w-4" />
                                        <span>Instagram</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Company Description */}
                    {data.companyDescription && (
                        <div className="mt-4">
                            <h3 className="text-xs font-bold text-darkBlue lg:text-sm">Company Description</h3>
                            <p className="mt-1 text-[9.6px] font-medium text-darkBlue lg:text-[11px]">{data.companyDescription}</p>
                        </div>
                    )}

                    {/* Professional Details Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-y-4 text-[10px] text-darkBlue lg:text-[11px]">
                        <div>
                            <p className="font-bold">Experience</p>
                            <p className="font-normal">{formatStringData(data.experience, 'Not Specified')}</p>
                        </div>
                        <div>
                            <p className="font-bold">Interest</p>
                            <p className="font-normal">{formatStringData(data.interest, 'Not Specified')}</p>
                        </div>
                        <div>
                            <p className="font-bold">Industry</p>
                            <p className="font-normal">{formatStringData(data.industry, 'Industry Not Specified')}</p>
                        </div>
                        <div>
                            <p className="font-bold">Company Stage</p>
                            <p className="font-normal">{formatStringData(data.companyStage, 'Stage Not Specified')}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="font-bold">Key Strength</p>
                            <p className="font-normal">{formatStringData(data.keyStrength, 'Not Specified')}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="font-bold">Top Goal</p>
                            <p className="font-normal">{formatStringData(data.topGoal, 'Goals Not Specified')}</p>
                        </div>
                    </div>
                </div>

                {/* Activity & Reputation */}
                <div className="mt-6 rounded-br-4xl bg-darkBlue px-5 py-4 pb-6 text-secondaryWhite shadow-[1px_2px_0px_2px_rgba(0,0,0,0.2),1px_2px_1px_1px_rgba(0,0,0,0.2)] lg:pb-14">
                    <h2 className="text-sm font-bold">Activity & Reputation</h2>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-4 text-sm md:flex-col md:flex-nowrap md:gap-x-0">
                        <div>
                            <p className="text-[10px] font-bold lg:text-[11px]">BRN Member Since</p>
                            <p className="text-[10px] font-light lg:text-[11px]">{formatDate(data.memberSince)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold lg:text-[11px]">Response Rate</p>
                            <p className="text-[10px] font-light lg:text-[11px]">{formatStringData(data.responseRate, 'Not Specified')}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] font-bold lg:text-[11px]">Successful Deals Rate</p>
                            <p className="text-[10px] font-light lg:text-[11px]">{formatStringData(data.successfulDealsRate, 'Not Specified')}</p>
                        </div>
                    </div>

                    <a href="#" className="mt-4 block text-xs font-medium italic underline md:mt-16">
                        View Reviews
                    </a>
                </div>
            </div>
        </div>
    );
}
