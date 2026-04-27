// components/leads/LeadsGridCard.tsx

import images from '@/constants/image';
import { Lead } from '@/dummyDatas/leads';
import { formatText } from '@/utils/format-character';

interface Props {
    lead: Lead;
    isCollected: boolean;
    collectionMode: boolean;
    onToggleCollection: () => void;
    onClick: () => void;
}

export default function LeadsGridCard({ lead, isCollected, collectionMode, onToggleCollection, onClick }: Props) {
    return (
        <div
            onClick={onClick}
            className="relative mx-4.5 cursor-pointer border-b border-b-[#F3F0E933] h-[96px] lg:h-[186px]   bg-transparent px-8 pt-4 pb-4 transition lg:mx-0 lg:rounded-2xl lg:border-b-0 lg:bg-white lg:px-0 lg:py-6 lg:shadow-[-2px_-2px_6px_-3px_rgba(0,0,0,0.6),-2px_2px_6px_-3px_rgba(0,0,0,0.6)] lg:hover:shadow-[-2px_-2px_6px_-3px_rgba(0,0,0,0.5),-2px_2px_6px_-3px_rgba(0,0,0,0.5)]"
        >
            {/* Top-left icon — COLLECTION STATUS (Desktop) */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollection();
                }}
                className="absolute top-4 left-4 hidden cursor-pointer lg:flex"
            >
                <div className="flex h-6 w-6 items-center justify-center rounded-md">
                    <img
                        src={isCollected ? images.leadsconnection : images.lightConnection}
                        alt={isCollected ? 'In collection' : 'Not in collection'}
                        className="h-5 w-5"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-4.5 lg:w-full lg:flex-col lg:justify-center lg:gap-x-0">
                    {/* Center icon */}

                    <div className="flex justify-center lg:mt-2 rounded-full bg-[#0D2F38]   lg:rounded-none lg:bg-transparent">
                        <div className="flex h-13 w-13 items-center justify-center rounded-full">
                            <img src={lead.logo} className="h-9 w-9" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4 text-left text-secondaryWhite lg:text-center lg:text-deepBlack">
                        <h3 className="mb-1.5 text-xs font-bold lg:mb-4 lg:font-semibold"> {formatText(`${lead.name}`, 10)}</h3>

                        <p className="text-[7px] leading-3 font-semibold tracking-widest lg:hidden"> {formatText(`${lead.email}`, 12)}</p>
                        <p className="hidden text-[7px] leading-3 font-semibold tracking-widest lg:block lg:text-[12px] lg:leading-3.5 lg:font-normal lg:tracking-wide">
                            {' '}
                            {formatText(`${lead.email}`, 20)}
                        </p>

                        <p className="text-[7px] font-extralight tracking-wider lg:hidden  lg:text-[9px] lg:font-light lg:tracking-tight">
                            {formatText(`${lead.position || lead.industry}`, 12)}
                        </p>
                        <p className="hidden text-[7px] font-extralight tracking-wider lg:block lg:mt-0.5 lg:text-[9px] lg:font-light lg:tracking-tight">
                            {' '}
                            {formatText(`${lead.position || lead.industry}`, 20)}
                        </p>
                    </div>
                </div>

                {/* Top-left icon — COLLECTION STATUS (Desktop) */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollection();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-md lg:hidden"
                >
                    <img src={isCollected ? images.desktopbold : images.mobilelight} className="h-8 w-8" alt="collection toggle" />
                </div>
            </div>
        </div>
    );
}
