'use client';

import images from '@/constants/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface DashboardLoaderProps {
    /** Duration for the loader in milliseconds (default: 6000ms) */
    duration?: number;
    /** Callback when loading is complete - if not provided, redirects to /dashboard */
    onComplete?: () => void;
}

export default function DashboardLoader({ duration = 6000, onComplete }: DashboardLoaderProps) {
    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        startTimeRef.current = Date.now();

        const animateProgress = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const progressPercent = Math.min((elapsed / duration) * 100, 100);

            setProgress(progressPercent);

            if (progressPercent < 100) {
                animationFrameRef.current = requestAnimationFrame(animateProgress);
            } else if (!hasCompletedRef.current) {
                // Progress complete - redirect after small delay
                hasCompletedRef.current = true;
                setTimeout(() => {
                    if (onComplete) {
                        onComplete();
                    } else {
                        window.location.href = "/dashboard";
                    }
                }, 300);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animateProgress);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [duration, onComplete]);

    return (
        <div
            style={{
                backgroundImage: `url(${images.formBG})`,
            }}
            className="relative flex h-screen flex-col items-center justify-center bg-white bg-cover bg-center bg-no-repeat"
        >
            <div className="absolute inset-0 bg-white opacity-30"></div>

            <div className="relative flex flex-col items-center justify-center   max-w-full w-full lg:w-[60%] z-10">
                {/* Logo */}
                <div className="mb-3 lg:mb-6 w-[200px] lg:w-[310px] h-20 relative ">

                    <img src={images.logo} alt="NOEL Logo" width={310} height={80} className="select-none object-cover absolute" />
                </div>

                {/* Loader Bar */}
                <div className="relative lg:mt-7 h-4 w-[70%] lg:w-[45%] overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.05, ease: 'linear' }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,#A47AF0_0%,#7F9BE8_20%,#0000004D_30%,#4FD3B9_60%,#27E6A7_100%)] shadow-[0_0_12px_rgba(164,122,240,0.25)]"
                    />
                </div>

                {/* Loader Text */}
                <div className="mx-auto mt-9 lg:mt-12 max-w-2xl text-center">
                    <h3 className=" text-[18px] font-bold text-primary dark:text-black">Preparing Your Dashboard</h3>

                    <p className="mb-2  text-xs font-light text-deepBlue">(This will take a few seconds)</p>

                    <p className="mx-auto max-w-md px-10 mt-2 leading-3.5 text-center text-[12px] text-deepBlue/90">
                        An exclusive ecosystem of leaders creating partnerships, deals, and growth opportunities across Africa.
                    </p>
                </div>
            </div>
        </div>
    );
}
