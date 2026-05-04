import { useClickOutsideToggle } from '@/hooks/use-click-outside-toggle';
import { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

type Props = {
    anchorRef: React.RefObject<HTMLDivElement | null>;
    children: React.ReactNode;
};

export default function MessageDropdown({ anchorRef, children }: Props) {
    const { ref, isOpen, toggle, close } = useClickOutsideToggle(false);
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!isOpen || !anchorRef.current) return;

        const rect = anchorRef.current.getBoundingClientRect();

        setStyle({
            position: 'fixed',
            top: rect.top + 6,          // small offset from top of bubble
            left: rect.right - 36,      // aligns to right edge
            zIndex: 9999,
        });
    }, [isOpen, anchorRef]);

    return (
        <>
            {/* Arrow button (anchored visually to bubble) */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    toggle();
                }}
                className="
                    absolute top-2 right-2
                    flex h-6 w-6 items-center justify-center
                    rounded-full bg-black/30
                    opacity-0 transition-all duration-200
                    group-hover:opacity-100 hover:bg-black/40
                "
                title="More options"
            >
                <IoIosArrowDown className="h-3.5 w-3.5 text-white" />
            </button>

            {/* Dropdown (JS positioned) */}
            {isOpen && (
                <div ref={ref} style={style}>
                    <div className="w-44 rounded-2xl bg-white py-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}
