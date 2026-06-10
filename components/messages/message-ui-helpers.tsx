'use client';

import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import images from '@/constants/image';
import { useClickOutsideToggle } from '@/hooks/use-click-outside-toggle';

export const icons = {
    archieve: {
        default: images.archievechat,
        active: images.whiteActive,
    },
    active: {
        default: images.readActivity1,
        active: images.whiteActive,
    },
    starred: {
        default: images.readActivity2,
        active: images.whiteStar,
    },
};

export const DropdownItem = ({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) => (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-1.5 pl-7 text-[10px] text-darkBlue hover:bg-gray-100/60">
        <img src={icon} className="h-5 w-5" alt="" />
        <span>{label}</span>
    </button>
);

export function MessageDropdown({ children }: { children: React.ReactNode }) {
    const { ref, isOpen, toggle } = useClickOutsideToggle(false);

    return (
        <div ref={ref} className="absolute top-0 right-0 z-[10]">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    toggle();
                }}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/30"
            >
                <IoIosArrowDown className="h-3.5 w-3.5 text-white" />
            </button>

            {isOpen && children}
        </div>
    );
}
