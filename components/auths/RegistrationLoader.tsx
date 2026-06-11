'use client';

import images from '@/constants/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface RegistrationLoaderProps {
    /** Current status of the registration process */
    status: 'uploading' | 'processing' | 'success' | 'error';
    /** Upload progress percentage (0-100) */
    uploadProgress?: number;
    /** Callback when loading animation completes (for success state) */
    onComplete?: () => void;
}

const statusMessages = {
    uploading: {
        title: 'Uploading Your Profile',
        description: 'Securely transferring your information...',
    },
    processing: {
        title: 'Creating Your Account',
        description: 'Setting up your personalized dashboard...',
    },
    success: {
        title: 'Welcome to NOEL!',
        description: 'Your account has been created successfully.',
    },
    error: {
        title: 'Something Went Wrong',
        description: 'Please try again or contact support.',
    },
};

export default function RegistrationLoader({
    status,
    uploadProgress = 0,
    onComplete
}: RegistrationLoaderProps) {
    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const hasCompletedRef = useRef(false);

    // Calculate progress based on status and upload progress
    useEffect(() => {
        if (status === 'uploading') {
            // During upload, progress is based on actual upload progress (0-50%)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProgress(Math.min(uploadProgress * 0.5, 50));
        } else if (status === 'processing') {
            // During processing, animate from 50% to 90%
            startTimeRef.current = Date.now();
            hasCompletedRef.current = false;

            const animateProgress = () => {
                const elapsed = Date.now() - startTimeRef.current;
                const duration = 8000; // 8 seconds for processing phase
                const progressPercent = 50 + Math.min((elapsed / duration) * 40, 40); // 50% to 90%

                setProgress(progressPercent);

                if (progressPercent < 90 && status === 'processing') {
                    animationFrameRef.current = requestAnimationFrame(animateProgress);
                }
            };

            animationFrameRef.current = requestAnimationFrame(animateProgress);
        } else if (status === 'success') {
            // On success, quickly animate to 100%
            startTimeRef.current = Date.now();

            const animateToComplete = () => {
                const elapsed = Date.now() - startTimeRef.current;
                const duration = 500; // Quick animation to 100%
                const currentProgress = progress;
                const progressPercent = currentProgress + Math.min((elapsed / duration) * (100 - currentProgress), 100 - currentProgress);

                setProgress(Math.min(progressPercent, 100));

                if (progressPercent < 100) {
                    animationFrameRef.current = requestAnimationFrame(animateToComplete);
                } else if (!hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    // Small delay before calling onComplete
                    setTimeout(() => {
                        if (onComplete) {
                            onComplete();
                        }
                    }, 500);
                }
            };

            animationFrameRef.current = requestAnimationFrame(animateToComplete);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [status, uploadProgress]);

    const currentMessage = statusMessages[status];

    return (
        <div
            style={{
                backgroundImage: `url(${images.formBG})`,
            }}
            className="relative flex h-screen flex-col items-center justify-center bg-white bg-cover bg-center bg-no-repeat"
        >
            <div className="absolute inset-0 bg-white opacity-30"></div>

            <div className="relative flex flex-col items-center justify-center max-w-full w-full lg:w-[60%] z-10">
                {/* Logo */}
                <div className="mb-3 lg:mb-6 w-[200px] lg:w-[310px] h-20 relative">
                    <img
                        src={images.logo}
                        alt="NOEL Logo"
                        width={310}
                        height={80}
                        className="select-none object-cover absolute"
                    />
                </div>

                {/* Loader Bar */}
                <div className="relative lg:mt-7 h-4 w-[70%] lg:w-[45%] overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,#A47AF0_0%,#7F9BE8_20%,#0000004D_30%,#4FD3B9_60%,#27E6A7_100%)] shadow-[0_0_12px_rgba(164,122,240,0.25)]"
                    />
                </div>

                {/* Progress percentage */}
                {/* <div className="mt-3 text-sm font-medium text-primary/70">
                    // {Math.round(progress)}%
                </div> */}

                {/* Loader Text */}
                <div className="mx-auto mt-6 lg:mt-8 max-w-2xl text-center">
                    <h3 className="text-[18px] font-bold text-primary dark:text-black">
                        {currentMessage.title}
                    </h3>

                    <p className="mb-2 text-xs font-light text-deepBlue">
                        (Please don&apos;t close this window)
                    </p>

                    <p className="mx-auto max-w-md px-10 mt-2 leading-3.5 text-center text-[12px] text-deepBlue/90">
                        {currentMessage.description}
                    </p>

                    {/* Status indicator dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0
                            }}
                            className="w-2 h-2 rounded-full bg-primary"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0.3
                            }}
                            className="w-2 h-2 rounded-full bg-primary"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0.6
                            }}
                            className="w-2 h-2 rounded-full bg-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
