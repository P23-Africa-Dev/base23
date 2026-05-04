'use client';

import images from '@/constants/image';
import SmartMatchService, { setCurrentUserId } from '@/services/smart-match-service';
import type { SmartMatchPreferences } from '@/types/smart-match';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PreferenceStage } from './PreferenceStage';

type SmartMatchSlideProps = {
    open: boolean;
    onClose: () => void;
    onPreferencesSaved?: () => void;
};

/* ================= Variants ================= */

const panelVariants: Variants = {
    hidden: { x: '100%' },
    visible: {
        x: 0,
        transition: { type: 'spring', stiffness: 90, damping: 18 },
    },
    exit: {
        x: '100%',
        transition: { duration: 0.2, ease: 'easeInOut' },
    },
};

const cardVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: (delay: number = 0) => ({
        y: 0,
        opacity: 1,
        transition: { delay, duration: 0.35 },
    }),
    exit: {
        y: 30,
        opacity: 0,
        transition: { duration: 0.15 },
    },
};

type Step = 'intro' | 1 | 2 | 3 | 4 | 5;

export default function ReferralSmatchProfile({ open, onClose, onPreferencesSaved }: SmartMatchSlideProps) {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<Step>('intro');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

    const { user } = useAuth();
    const authUserId = user?.id || 0;

    // Store preferences as user progresses through steps (new structure)
    const [preferences, setPreferences] = useState<Partial<SmartMatchPreferences>>({
        user_needs: null,
        preferred_industry: null,
        business_level: null,
        selected_tags: null,
    });

    // Track if user has existing preferences
    const [hasExistingPreferences, setHasExistingPreferences] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Set user ID when component mounts or authUserId changes
    useEffect(() => {
        if (authUserId > 0) {
            setCurrentUserId(authUserId);
        }
    }, [authUserId]);

    // Fetch existing preferences when modal opens
    useEffect(() => {
        if (open) {
            setStep('intro');
            fetchExistingPreferences();
        }
    }, [open]);

    // Fetch user's existing preferences from backend
    const fetchExistingPreferences = async () => {
        setIsLoadingPreferences(true);
        try {
            const response = await SmartMatchService.getPreferences();
            if (response.success && response.preferences) {
                const existingPrefs = response.preferences;
                setPreferences({
                    user_needs: existingPrefs.user_needs || null,
                    preferred_industry: existingPrefs.preferred_industry || null,
                    business_level: existingPrefs.business_level || null,
                    selected_tags: existingPrefs.selected_tags || null,
                });
                // Check if user has any preferences set
                setHasExistingPreferences(
                    !!(existingPrefs.user_needs ||
                        existingPrefs.preferred_industry ||
                        existingPrefs.business_level ||
                        (existingPrefs.selected_tags && existingPrefs.selected_tags.length > 0))
                );
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
            // Reset to empty on error
            setPreferences({
                user_needs: null,
                preferred_industry: null,
                business_level: null,
                selected_tags: null,
            });
            setHasExistingPreferences(false);
        } finally {
            setIsLoadingPreferences(false);
        }
    };

    // Handle step progression with preference updates
    const handleStepNext = (stepNum: 1 | 2 | 3 | 4 | 5, data: Partial<SmartMatchPreferences>) => {
        // Update preferences with the data from this step
        const updatedPreferences = {
            ...preferences,
            ...data,
        };
        setPreferences(updatedPreferences);

        if (stepNum === 5) {
            // Final step (summary) - save all preferences to backend
            // Pass the updated preferences directly to avoid stale state
            handleFinish(updatedPreferences);
        } else {
            // Move to next step
            setStep((stepNum + 1) as Step);
        }
    };

    // Save all preferences and close
    const handleFinish = async (finalPrefs?: Partial<SmartMatchPreferences>) => {
        // Prevent duplicate submissions
        if (isSaving) return;
        setIsSaving(true);

        try {
            // Use passed preferences if available (to avoid stale state), otherwise use current state
            const prefsToSave = finalPrefs || preferences;

            // Build final preferences
            const finalPreferences: SmartMatchPreferences = {
                user_needs: prefsToSave.user_needs || null,
                preferred_industry: prefsToSave.preferred_industry || null,
                business_level: prefsToSave.business_level || null,
                selected_tags: prefsToSave.selected_tags || null,
            };

            console.log('Submitting smart match preferences:', finalPreferences);

            const response = await SmartMatchService.saveAllPreferences(finalPreferences);

            if (response && response.success) {
                console.log('Smart match preferences saved successfully');
                // Notify parent and close modal
                onPreferencesSaved?.();
                onClose();
            } else {
                console.error('Failed to save preferences', response);
                // Provide immediate feedback so user knows something went wrong
                const msg = response?.message || 'Failed to save preferences. Please try again.';
                if (typeof window !== 'undefined') {
                    // eslint-disable-next-line no-alert
                    alert(msg);
                }
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            if (typeof window !== 'undefined') {
                // eslint-disable-next-line no-alert
                alert('An error occurred while saving preferences. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    const portalRoot = document.getElementById('overlay-root');
    if (!portalRoot) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* ================= OVERLAY ================= */}
                    <motion.div
                        className="fixed inset-0 z-[999] bg-black/10 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* ================= MODAL ================= */}
                    <motion.div
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-y-0 right-0 z-[1000] w-full bg-white md:inset-0 md:m-auto md:h-[75vh] md:max-w-[720px] md:rounded-3xl md:shadow-2xl"
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 flex h-5 w-5 items-center justify-center rounded-full text-white hover:text-white/60"
                        >
                            <X size={16} />
                        </button>

                        {/* ================= CONTENT ================= */}
                        <div className="flex h-full flex-col overflow-hidden">
                            <AnimatePresence mode="wait">
                                {/* ================= INTRO (NOT A STEP) ================= */}
                                {step === 'intro' && (
                                    <motion.div
                                        key="intro"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex h-full flex-col"
                                    >
                                        {/* TOP */}
                                        <div className="relative flex h-[62%] items-center md:rounded-t-2xl justify-center overflow-hidden bg-gradient-to-br from-[#4C2A85] via-[#7B4BB5] to-[#E07BE0]">

                                            <img src={images.referralPattern} className="absolute lg:hidden max-w-[260px] h-[350px] object-cover" alt="" />

                                            <div className="relative z-10 flex justify-center gap-x-1 items-center">
                                                <motion.div
                                                    custom={0.2}
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className=" "
                                                >
                                                    <ProfileCard image={images.man1} />
                                                </motion.div>

                                                <motion.div
                                                    custom={0.35}
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className="z-20"
                                                >
                                                    <ProfileCard image={images.man3} active />
                                                </motion.div>

                                                <motion.div
                                                    custom={0.5}
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className=""
                                                >
                                                    <ProfileCard image={images.man2} />
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* BOTTOM */}
                                        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
                                            <h2 className="text-base lg:text-[18px] font-extrabold text-deepBlack mb-6 lg:mb-5 mt-3">Smart Match Profile Setup</h2>

                                            <p className='font-medium text-[13px] lg:text-[14px] tracking-wider text-xs'>
                                                {hasExistingPreferences ? 'Update Your Preferences' : 'Optimize Your Connections'}
                                            </p>

                                            <p className="mt-1.5 text-[8px] lg:text-[10px] tracking-wide font-light lg:max-w-[360px] max-w-[250px] text-deepBlack">
                                                {hasExistingPreferences
                                                    ? 'Review and update your preferences to find better matches. Your current selections are saved and can be modified at any time.'
                                                    : 'Your Smart Match Profile ensures you\'re connected with the right people for the right opportunities. Just 2 minutes of setup can save you hours of irrelevant networking.'
                                                }
                                            </p>


                                            <button
                                                onClick={() => setStep(1)}
                                                disabled={isLoadingPreferences}
                                                className="mt-4 lg:mt-3 rounded-full shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.4),-2px_3px_5px_-1px_rgba(0,0,0,0.4)] bg-darkBlue px-13 py-3 text-[10px] font-semibold text-secondaryWhite disabled:opacity-50"
                                            >
                                                {isLoadingPreferences
                                                    ? 'Loading...'
                                                    : hasExistingPreferences
                                                        ? 'Update Preferences'
                                                        : 'Try it Now'
                                                }
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ================= STEP 1: User Needs ================= */}
                                {step === 1 && (
                                    <div key="step-1" className="h-full">
                                        <PreferenceStage
                                            step={1}
                                            totalSteps={5}
                                            onBack={() => setStep('intro')}
                                            onNext={(data) => handleStepNext(1, data)}
                                            onClose={onClose}
                                            preferences={preferences}
                                        />
                                    </div>
                                )}

                                {/* ================= STEP 2: Industries ================= */}
                                {step === 2 && (
                                    <div key="step-2" className="h-full">
                                        <PreferenceStage
                                            step={2}
                                            totalSteps={5}
                                            onBack={() => setStep(1)}
                                            onNext={(data) => handleStepNext(2, data)}
                                            onClose={onClose}
                                            preferences={preferences}
                                        />
                                    </div>
                                )}

                                {/* ================= STEP 3: Business Level ================= */}
                                {step === 3 && (
                                    <div key="step-3" className="h-full">
                                        <PreferenceStage
                                            step={3}
                                            totalSteps={5}
                                            onBack={() => setStep(2)}
                                            onNext={(data) => handleStepNext(3, data)}
                                            onClose={onClose}
                                            preferences={preferences}
                                        />
                                    </div>
                                )}

                                {/* ================= STEP 4: Tags ================= */}
                                {step === 4 && (
                                    <div key="step-4" className="h-full">
                                        <PreferenceStage
                                            step={4}
                                            totalSteps={5}
                                            onBack={() => setStep(3)}
                                            onNext={(data) => handleStepNext(4, data)}
                                            onClose={onClose}
                                            preferences={preferences}
                                        />
                                    </div>
                                )}

                                {/* ================= STEP 5: Summary ================= */}
                                {step === 5 && (
                                    <div key="step-5" className="h-full">
                                        <PreferenceStage
                                            step={5}
                                            totalSteps={5}
                                            onBack={() => setStep(4)}
                                            onNext={(data) => handleStepNext(5, data)}
                                            onClose={onClose}
                                            preferences={preferences}
                                            isSaving={isSaving}
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        portalRoot,
    );
}

// /* ================= Profile Card ================= */

function ProfileCard({ image, active }: { image: string; active?: boolean }) {
    return (

        <div className={`flex ${active ? "h-[210px] w-[120px] lg:h-[230px] lg:w-[150px]" : "h-[171px] w-[100px]"}  flex-col items-center justify-center rounded-xl bg-white p-1 shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.4),-2px_3px_5px_-1px_rgba(0,0,0,0.4)]`}>
            <div className="relative flex w-full h-full flex-col gap-3">
                <div
                    style={{ backgroundImage: `url(${image})` }}
                    className="h-full w-full overflow-hidden rounded-lg  bg-cover bg-top bg-no-repeat shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.3),-2px_3px_5px_-1px_rgba(0,0,0,0.3)]"
                ></div>

                {/* Overlay for the active card */}
                <div
                    style={{
                        backgroundImage: ` url(${images.blurProfilename})`,
                    }}
                    className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 rounded-xl bg-cover bg-center bg-no-repeat px-3 text-right"
                >
                    <div className="py-4 pr-3 text-white">
                        <h1 className="text-[8px] leading-1 whitespace-nowrap font-extrabold"> Jamal Agoro</h1>
                        <p className="mt-1 text-[8px] font-medium">CTO AfriLaw</p>
                    </div>
                </div>

                {/* Compatibility */}
                <div className="flex w-full flex-col items-center gap-3 -mt-1.5 px-4">
                    <div className="flex items-center gap-1">
                        <div className="flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[#193E47]">
                            <div className="relative h-2 w-2">
                                <img src={images.aiMagic} className="absolute object-contain" alt="" />
                            </div>
                        </div>

                        <div className="leading-1">
                            <h5 className="text-[3.4px] lg:text-[4.5px] whitespace-nowrap">Smart Matching </h5>
                            <p className="text-[4px] font-bold">Compatibility</p>
                        </div>
                        <div className="text-[7px] font-extrabold">92%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
