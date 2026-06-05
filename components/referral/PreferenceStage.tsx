import images from '@/constants/image';
import { getSuggestedTags, searchTags, TAG_CATEGORIES } from '@/data/smart-match-tags';
import type { BusinessLevel, PreferredIndustry, SmartMatchPreferences } from '@/types/smart-match';
import { BUSINESS_LEVELS, INDUSTRIES } from '@/types/smart-match';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type PreferenceStageProps = {
    step: number;
    totalSteps?: number;
    onBack: () => void;
    onNext: (data: Partial<SmartMatchPreferences>) => void;
    onClose: () => void;
    preferences: Partial<SmartMatchPreferences>;
    isSaving?: boolean;
};

/* ================= STEP CONTENT ================= */

const STEP_CONTENT = {
    1: {
        title: 'What do you need help with?',
        subtitle: 'Describe what you\'re looking for or the problem you want to solve',
        field: 'user_needs' as const,
        type: 'text-input' as const,
    },
    2: {
        title: 'Select your preferred industry',
        subtitle: 'Choose the industry most relevant to your needs',
        field: 'preferred_industry' as const,
        type: 'single-select-industry' as const,
    },
    3: {
        title: 'Business experience level',
        subtitle: 'Select the years of operation you prefer to work with',
        field: 'business_level' as const,
        type: 'single-select' as const,
    },
    4: {
        title: 'Select relevant tags',
        subtitle: 'Choose up to 5 tags that best describe what you need',
        field: 'selected_tags' as const,
        type: 'tag-select' as const,
    },
    5: {
        title: 'Review your preferences',
        subtitle: 'Please confirm your selections before proceeding',
        field: 'summary' as const,
        type: 'summary' as const,
    },
} as const;

export function PreferenceStage({
    step,
    totalSteps = 5,
    onBack,
    onNext,
    onClose,
    preferences,
    isSaving = false
}: PreferenceStageProps) {
    const stepContent = STEP_CONTENT[step as keyof typeof STEP_CONTENT];

    const handleNext = (data: Partial<SmartMatchPreferences>) => {
        onNext(data);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <TextInputStep
                        initialValue={preferences.user_needs || ''}
                        onNext={(value) => handleNext({ user_needs: value })}
                        onBack={onBack}
                        step={step}
                        totalSteps={totalSteps}
                    />
                );
            case 2:
                return (
                    <SingleSelectIndustryStep
                        initialValue={preferences.preferred_industry || null}
                        onNext={(value) => handleNext({ preferred_industry: value })}
                        onBack={onBack}
                        step={step}
                        totalSteps={totalSteps}
                    />
                );
            case 3:
                return (
                    <SingleSelectStep
                        initialValue={preferences.business_level || null}
                        options={BUSINESS_LEVELS}
                        onNext={(value) => handleNext({ business_level: value })}
                        onBack={onBack}
                        step={step}
                        totalSteps={totalSteps}
                    />
                );
            case 4:
                return (
                    <TagSelectStep
                        initialValue={preferences.selected_tags || []}
                        selectedIndustry={preferences.preferred_industry || null}
                        onNext={(value) => handleNext({ selected_tags: value })}
                        onBack={onBack}
                        step={step}
                        totalSteps={totalSteps}
                    />
                );
            case 5:
                return (
                    <SummaryStep
                        preferences={preferences}
                        onNext={() => handleNext({})}
                        onBack={onBack}
                        step={step}
                        totalSteps={totalSteps}
                        isSaving={isSaving}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative flex h-full flex-1 flex-col items-center justify-center bg-[linear-gradient(180deg,#C15AEB_0%,#422B8C_100%)] px-4 py-6 text-white md:rounded-2xl">
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex w-full flex-1 flex-col items-center justify-center"
            >
                {/* ================= TITLE ================= */}
                <div className="mb-6 text-center">
                    <h2 className="mb-2 text-lg font-semibold leading-tight">{stepContent.title}</h2>
                    <p className="text-xs text-white/80">{stepContent.subtitle}</p>
                </div>

                {/* ================= STEP CONTENT ================= */}
                {renderStepContent()}
            </motion.div>
        </div>
    );
}

/* ================= STEP 1: TEXT INPUT ================= */

interface TextInputStepProps {
    initialValue: string;
    onNext: (value: string) => void;
    onBack: () => void;
    step: number;
    totalSteps: number;
}

function TextInputStep({ initialValue, onNext, onBack, step, totalSteps }: TextInputStepProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const isValid = value.trim().length >= 10;

    return (
        <div className="flex w-full max-w-md flex-col items-center">
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="E.g., I need help with finding investors for my tech startup, or I'm looking for a marketing expert to help grow my e-commerce business..."
                className="h-32 w-full resize-none rounded-xl border-2 border-white/30 bg-white/10 p-4 text-sm text-white placeholder-white/50 focus:border-white/60 focus:outline-none"
                maxLength={500}
            />
            <div className="mt-2 w-full text-right text-xs text-white/60">
                {value.length}/500 characters {!isValid && value.length > 0 && '(min 10 characters)'}
            </div>

            <StepActions
                onBack={onBack}
                onNext={() => onNext(value.trim())}
                isValid={isValid}
                step={step}
                totalSteps={totalSteps}
            />
        </div>
    );
}

/* ================= STEP 2: SINGLE-SELECT INDUSTRY (Card Layout) ================= */

interface SingleSelectIndustryStepProps {
    initialValue: PreferredIndustry | null;
    onNext: (value: PreferredIndustry) => void;
    onBack: () => void;
    step: number;
    totalSteps: number;
}

function SingleSelectIndustryStep({ initialValue, onNext, onBack, step, totalSteps }: SingleSelectIndustryStepProps) {
    const [selected, setSelected] = useState<PreferredIndustry | null>(initialValue);

    useEffect(() => {
        setSelected(initialValue);
    }, [initialValue]);

    const isValid = selected !== null;

    return (
        <div className="flex w-full max-w-lg flex-col items-center">
            <div className="custom-scrollbar max-h-[300px] w-full overflow-y-auto px-2">
                <div className="mx-auto flex flex-wrap items-center justify-center gap-4">
                    {INDUSTRIES.map((industry) => {
                        const isActive = selected === industry;
                        return (
                            <button
                                key={industry}
                                onClick={() => setSelected(industry)}
                                className={`relative flex h-[72px] w-[124px] items-center justify-center rounded-xl px-3 text-center text-[11px] font-bold shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)] transition-all ${isActive
                                    ? 'border-2 border-transparent bg-[#420B38] text-white'
                                    : 'border-2 border-transparent bg-white text-[#420B38] hover:bg-gray-50'
                                    }`}
                            >
                                {industry}
                                {isActive && (
                                    <div className="absolute -top-2 -right-2">
                                        <div className="relative h-6 w-6">
                                            <img src={images.checkmarksmatch} className="absolute object-contain" alt="" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <StepActions
                onBack={onBack}
                onNext={() => selected && onNext(selected)}
                isValid={isValid}
                step={step}
                totalSteps={totalSteps}
            />
        </div>
    );
}

/* ================= STEP 3: SINGLE SELECT (BUSINESS LEVEL) ================= */

interface SingleSelectStepProps {
    initialValue: BusinessLevel | null;
    options: readonly BusinessLevel[];
    onNext: (value: BusinessLevel) => void;
    onBack: () => void;
    step: number;
    totalSteps: number;
}

function SingleSelectStep({ initialValue, options, onNext, onBack, step, totalSteps }: SingleSelectStepProps) {
    const [selected, setSelected] = useState<BusinessLevel | null>(initialValue);

    useEffect(() => {
        setSelected(initialValue);
    }, [initialValue]);

    const isValid = selected !== null;

    const getDescription = (option: BusinessLevel): string => {
        switch (option) {
            case 'Below 5 years':
                return 'Early-stage';
            case '5 - 10 years':
                return 'Growing';
            case '10+ years':
                return 'Mature';
            default:
                return '';
        }
    };

    return (
        <div className="flex w-full max-w-md flex-col items-center">
            <div className="flex flex-wrap justify-center gap-3">
                {options.map((option) => {
                    const isActive = selected === option;
                    return (
                        <button
                            key={option}
                            onClick={() => setSelected(option)}
                            className={`relative flex h-[90px] w-[140px] flex-col items-center justify-center rounded-xl shadow-md transition-all ${isActive
                                    ? 'bg-[#420B38] text-white ring-2 ring-[#15A285]'
                                    : 'bg-white text-[#420B38] hover:bg-white/90'
                                }`}
                        >
                            <span className="text-sm font-bold">{option}</span>
                            <span className={`mt-1 text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                                {getDescription(option)}
                            </span>
                            {isActive && (
                                <div className="absolute -top-1.5 -right-1.5">
                                    <div className="relative h-6 w-6">
                                        <img src={images.checkmarksmatch} className="absolute object-contain" alt="" />
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <StepActions
                onBack={onBack}
                onNext={() => selected && onNext(selected)}
                isValid={isValid}
                step={step}
                totalSteps={totalSteps}
            />
        </div>
    );
}

/* ================= STEP 4: TAG SELECT WITH SEARCH ================= */

interface TagSelectStepProps {
    initialValue: string[];
    selectedIndustry: PreferredIndustry | null;
    onNext: (value: string[]) => void;
    onBack: () => void;
    step: number;
    totalSteps: number;
}

function TagSelectStep({ initialValue, selectedIndustry, onNext, onBack, step, totalSteps }: TagSelectStepProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialValue);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        setSelectedTags(initialValue);
    }, [initialValue]);

    const MAX_TAGS = 5;

    // Get suggested tags based on selected industry
    const suggestedTags = useMemo(() => {
        return getSuggestedTags(selectedIndustry);
    }, [selectedIndustry]);

    // Get search results
    const searchResults = useMemo(() => {
        if (searchQuery.trim()) {
            return searchTags(searchQuery, selectedTags);
        }
        return [];
    }, [searchQuery, selectedTags]);

    // Get tags for selected category
    const categoryTags = useMemo(() => {
        if (selectedCategory) {
            const category = TAG_CATEGORIES.find((c) => c.name === selectedCategory);
            return category ? category.tags.filter((t) => !selectedTags.includes(t)) : [];
        }
        return [];
    }, [selectedCategory, selectedTags]);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags((prev) => prev.filter((t) => t !== tag));
        } else if (selectedTags.length < MAX_TAGS) {
            setSelectedTags((prev) => [...prev, tag]);
        }
    };

    const removeTag = (tag: string) => {
        setSelectedTags((prev) => prev.filter((t) => t !== tag));
    };

    const isValid = selectedTags.length > 0;
    const canAddMore = selectedTags.length < MAX_TAGS;

    // Display tags: either search results, category tags, or suggested tags
    const displayTags = searchQuery.trim()
        ? searchResults
        : selectedCategory
            ? categoryTags
            : suggestedTags.filter((t) => !selectedTags.includes(t));

    return (
        <div className="flex w-full max-w-lg flex-col items-center">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="mb-4 w-full">
                    <div className="mb-2 text-xs font-medium text-white/80">
                        Selected ({selectedTags.length}/{MAX_TAGS}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 rounded-full bg-[#15A285] px-3 py-1.5 text-xs font-medium text-white"
                            >
                                {tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 rounded-full p-0.5 hover:bg-white/20"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Input */}
            <div className="relative mb-3 w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedCategory(null);
                    }}
                    placeholder="Search for tags..."
                    className="w-full rounded-lg border-2 border-white/30 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/50 focus:border-white/60 focus:outline-none"
                />
            </div>

            {/* Category Dropdown */}
            <div className="relative mb-3 w-full">
                <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex w-full items-center justify-between rounded-lg border-2 border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white/80"
                >
                    <span>{selectedCategory || 'Browse by category'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {showCategoryDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg bg-white shadow-lg"
                        >
                            <button
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setShowCategoryDropdown(false);
                                    setSearchQuery('');
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                            >
                                Show suggested tags
                            </button>
                            {TAG_CATEGORIES.map((category) => (
                                <button
                                    key={category.name}
                                    onClick={() => {
                                        setSelectedCategory(category.name);
                                        setShowCategoryDropdown(false);
                                        setSearchQuery('');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {category.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tags Display */}
            <div className="custom-scrollbar max-h-[180px] w-full overflow-y-auto">
                <div className="mb-2 text-xs font-medium text-white/60">
                    {searchQuery.trim()
                        ? `Search results for "${searchQuery}":`
                        : selectedCategory
                            ? `Tags in ${selectedCategory}:`
                            : 'Suggested tags based on your selections:'}
                </div>
                <div className="flex flex-wrap gap-2">
                    {displayTags.length > 0 ? (
                        displayTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                disabled={!canAddMore && !selectedTags.includes(tag)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedTags.includes(tag)
                                    ? 'bg-[#15A285] text-white'
                                    : canAddMore
                                        ? 'bg-white/90 text-[#420B38] hover:bg-white'
                                        : 'cursor-not-allowed bg-white/40 text-gray-400'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))
                    ) : (
                        <p className="text-xs text-white/50">
                            {searchQuery.trim() ? 'No tags found. Try a different search.' : 'No tags available.'}
                        </p>
                    )}
                </div>
            </div>

            <StepActions
                onBack={onBack}
                onNext={() => onNext(selectedTags)}
                isValid={isValid}
                step={step}
                totalSteps={totalSteps}
            />
        </div>
    );
}

/* ================= STEP 5: SUMMARY ================= */

interface SummaryStepProps {
    preferences: Partial<SmartMatchPreferences>;
    onNext: () => void;
    onBack: () => void;
    step: number;
    totalSteps: number;
    isSaving?: boolean;
}

function SummaryStep({ preferences, onNext, onBack, step, totalSteps, isSaving }: SummaryStepProps) {
    return (
        <div className="flex w-full max-w-lg flex-col items-center">
            <div className="custom-scrollbar max-h-[320px] w-full overflow-y-auto rounded-xl bg-white/10 p-4">
                {/* Needs */}
                <div className="mb-4">
                    <h4 className="mb-1 text-xs font-semibold text-[#15A285]">What you need:</h4>
                    <p className="text-sm text-white/90">
                        {preferences.user_needs || 'Not specified'}
                    </p>
                </div>

                {/* Industries */}
                <div className="mb-4">
                    <h4 className="mb-2 text-xs font-semibold text-[#15A285]">Preferred Industry:</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {preferences.preferred_industry ? (
                            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs text-white">
                                {preferences.preferred_industry}
                            </span>
                        ) : (
                            <span className="text-xs text-white/50">Not specified</span>
                        )}
                    </div>
                </div>

                {/* Business Level */}
                <div className="mb-4">
                    <h4 className="mb-1 text-xs font-semibold text-[#15A285]">Business Experience Level:</h4>
                    <p className="text-sm text-white/90">
                        {preferences.business_level || 'Not specified'}
                    </p>
                </div>

                {/* Tags */}
                <div>
                    <h4 className="mb-2 text-xs font-semibold text-[#15A285]">Selected Tags:</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {preferences.selected_tags && preferences.selected_tags.length > 0 ? (
                            preferences.selected_tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-[#15A285]/30 px-2.5 py-1 text-xs text-white"
                                >
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-white/50">Not specified</span>
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-3 text-center text-xs text-white/60">
                Click "Finish" to save your preferences and find your best matches!
            </p>

            <StepActions
                onBack={onBack}
                onNext={onNext}
                isValid={true}
                step={step}
                totalSteps={totalSteps}
                isSaving={isSaving}
                isLastStep={true}
            />
        </div>
    );
}

/* ================= SHARED STEP ACTIONS ================= */

interface StepActionsProps {
    onBack: () => void;
    onNext: () => void;
    isValid: boolean;
    step: number;
    totalSteps: number;
    isSaving?: boolean;
    isLastStep?: boolean;
}

function StepActions({ onBack, onNext, isValid, step, totalSteps, isSaving, isLastStep }: StepActionsProps) {
    return (
        <>
            {/* Actions */}
            <div className="mt-6 flex w-full max-w-sm gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 rounded-full border border-[#15A285] px-4 py-2.5 text-xs font-medium text-[#15A285] transition-colors hover:bg-[#15A285]/10"
                >
                    Return
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid || isSaving}
                    className="flex-1 rounded-full bg-[#15A285] px-8 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-[#15A285]/90 disabled:opacity-40"
                >
                    {isSaving ? 'Saving...' : isLastStep ? 'Finish' : 'Proceed'}
                </button>
            </div>

            {/* Step Tracker */}
            <div className="mt-6 flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => {
                    const index = i + 1;
                    const isActive = index === step;
                    const isCompleted = index < step;

                    return (
                        <div
                            key={index}
                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-semibold transition-all ${isActive
                                ? 'border-[#15A285] bg-[#15A285] text-white'
                                : isCompleted
                                    ? 'border-[#15A285] bg-transparent text-[#15A285]'
                                    : 'border-white/40 bg-transparent text-white/40'
                                }`}
                        >
                            {isCompleted ? <Check className="h-3 w-3" /> : index}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

// Export the step content for use in parent component
export { STEP_CONTENT };
