'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import images from '@/constants/image';

interface Props {
    message: string;
    buttonText: string;
    buttonLink: string;
    title?: string;
}

export default function AuthErrorPage({ message, buttonText, buttonLink, title = 'Oops!' }: Props) {
    const handleClick = () => {
        window.location.href = buttonLink;
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <div className="max-w-md space-y-4 text-center">
                <div className="flex w-full items-center justify-center">
                    <img src={images.errorBg} alt="" />
                </div>
                <h1 className="text-2xl font-bold text-[#0E0842]">{title}</h1>

                <p className="text-[#5E4F85]">{message}</p>
                <Button onClick={handleClick} className="cursor-pointer bg-[#1D1D1D] px-6 py-2 text-white hover:cursor-pointer hover:bg-[#1D1D1D]/90">
                    {buttonText}
                </Button>
            </div>
        </div>
    );
}