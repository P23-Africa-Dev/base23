import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import images from '@/constants/image';

type MessageActionsDropdownProps = {
    onDelete?: () => void;
    onClear?: () => void;
    onBlock?: () => void;
    onMore?: () => void;
    onActivity?: () => void;
    onFlag?: () => void;
};

export default function MessageActionsDropdown({
    onDelete,
    onClear,
    onBlock,
    onMore,
    onActivity,
    onFlag,
}: MessageActionsDropdownProps) {
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const handleMoreClick = () => {
        setIsMoreOpen(true);
        onMore?.();
    };

    return (
        <div className="w-44 lg:w-50 rounded-3xl bg-white py-3 pb-5 shadow-[-2px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.1)]">
            {/* TOP SECTION (Animated Replace) */}
            <AnimatePresence mode="wait">
                {!isMoreOpen ? (
                    <motion.div
                        key="default-actions"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 space-y-2 lg:space-y-1"
                    >
                        <ActionRow icon={images.deletchats} label="Delete Messages" onClick={onDelete} />
                        <ActionRow icon={images.clearmessages} label="Clear Messages" onClick={onClear} />
                        <ActionRow icon={images.blockuser} label="Block User" onClick={onBlock} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="more-actions"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 space-y-2"
                    >
                        <ActionRow
                            icon={images.activityuser}
                            label="Archive Chat"
                            onClick={onActivity}
                        />
                        <ActionRow
                            icon={images.flaguser}
                            label="Report User"
                            onClick={onFlag}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Divider */}
            <div className="my-2 h-[2px] bg-[#E5E6E9]" />

            {/* BOTTOM BAR */}
            <div className="flex items-center justify-between px-5">
                {!isMoreOpen ? (
                    <div
                        onClick={handleMoreClick}
                        className="flex cursor-pointer items-center gap-3 text-[11px] font-medium text-darkBlue hover:opacity-80"
                    >
                        <img src={images.moreoptions} className="h-4 w-4 lg:h-6 lg:w-6 object-contain" />
                        <span>More</span>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsMoreOpen(false)}
                        className="text-[11px] font-medium text-gray-400 hover:text-darkBlue"
                    >
                        Back
                    </button>
                )}

                {/* ICON ACTIONS */}
                <div className="flex items-center gap-3">
                    <TooltipWrapper label="Archive chat" enabled={!isMoreOpen}>
                        <IconButton icon={images.activityuser} onClick={onActivity} />
                    </TooltipWrapper>

                    <TooltipWrapper label="Report user" enabled={!isMoreOpen}>
                        <IconButton icon={images.flaguser} onClick={onFlag} />
                    </TooltipWrapper>
                </div>
            </div>
        </div>
    );
}


function TooltipWrapper({
    label,
    enabled,
    children,
}: {
    label: string;
    enabled: boolean;
    children: React.ReactNode;
}) {
    if (!enabled) return <>{children}</>;

    return (
        <div className="group relative">
            {children}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[9px] text-white opacity-0 transition group-hover:opacity-100">
                {label}
            </div>
        </div>
    );
}


function ActionRow({ icon, label, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="flex cursor-pointer items-center gap-3 px-5 py-1.5 text-[11px] text-darkBlue hover:bg-gray-100"
        >
            <img src={icon} className="h-6 w-6 object-contain" />
            <span>{label}</span>
        </div>
    );
}

function IconButton({ icon, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="flex h-6 w-6 lg:h-9 lg:w-9 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
            <img src={icon} className="h-4 w-4 lg:h-5 lg:w-5 object-contain" />
        </div>
    );
}
