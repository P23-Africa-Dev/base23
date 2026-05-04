'use client';

import images from '@/constants/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Hand, MousePointerClick, RefreshCw, Search, Settings, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type TutorialStep = {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    illustration: React.ReactNode;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
};

const tutorialSteps: TutorialStep[] = [
    {
        id: 1,
        title: 'Welcome to Smart Match!',
        description: 'Discover business connections tailored just for you. Our AI-powered matching finds the perfect partners based on your preferences.',
        icon: <Sparkles className="w-8 h-8 text-white" />,
        illustration: (
            <div className="relative flex items-center justify-center h-48">
                <motion.div
                    className="absolute"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Sparkles className="w-20 h-20 text-purple-500" />
                </motion.div>
            </div>
        ),
    },
    {
        id: 2,
        title: 'Set Your Preferences',
        description: 'Click the "Set-up New Profile" button to tell us who you want to connect with. Choose your preferred roles, company stages, and geography.',
        icon: <Settings className="w-8 h-8 text-white" />,
        illustration: (
            <div className="relative flex flex-col items-center justify-center h-48 gap-4">
                <motion.div
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Settings className="w-6 h-6 text-white" />
                    <span className="text-white font-semibold">Set-up New Profile</span>
                </motion.div>
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >
                    <MousePointerClick className="w-8 h-8 text-gray-600" />
                </motion.div>
            </div>
        ),
    },
    {
        id: 3,
        title: 'Swipe Through Matches',
        description: 'Drag left or right anywhere on the cards to browse your smart matches. Each card shows compatibility scores based on your preferences.',
        icon: <Hand className="w-8 h-8 text-white" />,
        illustration: (
            <div className="relative flex items-center justify-center h-48">
                {/* Background cards */}
                <motion.div
                    className="absolute w-28 h-40 rounded-2xl bg-gray-200 shadow-md"
                    style={{ rotate: -8, x: -20 }}
                />
                <motion.div
                    className="absolute w-28 h-40 rounded-2xl bg-gray-300 shadow-md"
                    style={{ rotate: 8, x: 20 }}
                />
                {/* Main card with swipe animation */}
                <motion.div
                    className="relative w-32 h-44 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center z-10"
                    animate={{ x: [0, 30, 0, -30, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 mb-2" />
                    <div className="w-20 h-2 rounded bg-gray-300 mb-1" />
                    <div className="w-14 h-2 rounded bg-gray-200" />
                    <div className="mt-2 px-2 py-1 rounded-full bg-green-100 text-green-600 text-[10px] font-bold">
                        85% Match
                    </div>
                </motion.div>
                {/* Swipe hand indicator */}
                <motion.div
                    className="absolute bottom-2 right-4"
                    animate={{ x: [0, 20, 0, -20, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                        <Hand className="w-6 h-6 text-gray-600" />
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                </motion.div>
            </div>
        ),
    },
    {
        id: 4,
        title: 'Make a Connection',
        description: 'Found someone interesting? Click "Match us!" to send a connection request and start a conversation with your potential business partner.',
        icon: <MousePointerClick className="w-8 h-8 text-white" />,
        illustration: (
            <div className="relative flex flex-col items-center justify-center h-48 gap-4">
                <motion.button
                    className="px-6 py-3 rounded-full bg-[#193E47] text-white font-semibold shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    Match us!
                </motion.button>
                <motion.div
                    className="flex items-center gap-2 text-sm text-gray-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-400"
                        animate={{ x: [0, 20, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                    <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400"
                        animate={{ x: [0, -20, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </div>
        ),
    },
    {
        id: 5,
        title: 'Search & Refresh',
        description: 'Use the search bar to find specific matches by name, company, or industry. Click refresh to discover new potential connections!',
        icon: <Search className="w-8 h-8 text-white" />,
        illustration: (
            <div className="relative flex flex-col items-center justify-center h-48 gap-4">
                <motion.div
                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 bg-white shadow-sm w-56"
                    animate={{ boxShadow: ['0 0 0 0 rgba(99, 102, 241, 0)', '0 0 0 4px rgba(99, 102, 241, 0.3)', '0 0 0 0 rgba(99, 102, 241, 0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Search className="w-5 h-5 text-gray-400" />
                    <motion.span
                        className="text-gray-400 text-sm"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        Search matches...
                    </motion.span>
                </motion.div>
                <motion.div
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#D6F955] shadow-md"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <RefreshCw className="w-6 h-6 text-gray-800" />
                </motion.div>
            </div>
        ),
    },
];

export default function SmartMatchTutorial({ isOpen, onClose, onComplete }: Props) {
    const [currentStep, setCurrentStep] = useState(0);

    // Mark tutorial as seen when completing or skipping
    const markTutorialAsSeen = useCallback(() => {
        localStorage.setItem('smart_match_tutorial_seen', 'true');
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            markTutorialAsSeen();
            onComplete();
        }
    }, [currentStep, onComplete, markTutorialAsSeen]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const handleSkip = useCallback(() => {
        markTutorialAsSeen();
        onComplete();
    }, [onComplete, markTutorialAsSeen]);

    // Reset step when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                handleSkip();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext, handlePrev, handleSkip]);

    if (!isOpen) return null;

    const step = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleSkip}
            >
                <motion.div
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with gradient */}
                    <div className="relative bg-gradient-to-r from-[#193E47] to-[#2d5a66] px-6 py-8">
                        {/* Close button */}
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mb-4">
                            {tutorialSteps.map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`h-1.5 rounded-full ${idx === currentStep ? 'bg-[#D6F955] w-8' : 'bg-white/30 w-4'}`}
                                    animate={{ width: idx === currentStep ? 32 : 16 }}
                                    transition={{ duration: 0.3 }}
                                />
                            ))}
                        </div>

                        {/* Icon and title */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20"
                                key={step.id}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                                {step.icon}
                            </motion.div>
                            <motion.h2
                                className="text-xl font-bold text-white"
                                key={`title-${step.id}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {step.title}
                            </motion.h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        {/* Illustration */}
                        <motion.div
                            key={`illustration-${step.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4"
                        >
                            {step.illustration}
                        </motion.div>

                        {/* Description */}
                        <motion.p
                            className="text-gray-600 text-center leading-relaxed"
                            key={`desc-${step.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {step.description}
                        </motion.p>
                    </div>

                    {/* Footer with navigation */}
                    <div className="px-6 pb-6 flex items-center justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentStep === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSkip}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Skip
                            </button>
                            <motion.button
                                onClick={handleNext}
                                className="flex items-center gap-1 px-6 py-2.5 rounded-full bg-[#193E47] text-white font-semibold shadow-lg hover:bg-[#234f5a] transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLastStep ? "Let's Go!" : 'Next'}
                                {!isLastStep && <ChevronRight className="w-4 h-4" />}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
