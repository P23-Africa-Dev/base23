import images from '@/constants/image';
import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';

interface DropdownToggleProps {
    isActive: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    disabled?: boolean;
}

const DropdownToggle: React.FC<DropdownToggleProps> = ({ isActive, onClick, className = '', disabled = false }) => {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            title="More options"
            className={`flex h-6 w-6 relative right-6 items-center justify-center transition-opacity duration-200 ${className} `}
        >

            {isActive ? (
                <img src={images.dashedline} alt="options" className="h-10 w-10 select-none" draggable={false} />
            ) : (
                <IoIosArrowDown className="h-4 w-4 text-darkBlue" />
            )}
        </button>
    );
};

export default DropdownToggle;
