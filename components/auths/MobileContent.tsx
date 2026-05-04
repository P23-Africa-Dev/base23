'use client';

import images from '@/constants/image';

type StepMeta = {
    title: string;
    description: string;
    headingClassName?: string;
    paragraphClassName?: string;
};

type MobileTopContentProps = {
    step?: number; // optional, only used if steps are provided
    steps?: string[]; // optional
    content: StepMeta | StepMeta[]; // can be single or array
};

export default function MobileTopContent({ step, steps, content }: MobileTopContentProps) {
    const isMultiStep = Array.isArray(content) && steps && step !== undefined;

    // Pick correct content
    const currentContent = isMultiStep ? content[step - 1] : (content as StepMeta);

    if (!currentContent) return null;

    return (
        // <div
        //     style={{
        //         backgroundImage: `url(${images.topFormBg})`,
        //     }}
        //     className="relative pt-10 pb-20 pl-8 md:hidden"
        // >
        //     <img src={images.topFormBg} className="absolute h-auto w-full object-contain" alt="" />
        //     {/* <div className="rounded-[10%_10%_0%_41%/0%_0%_18%_26%] bg-deepBlack pt-10 pb-20 pl-8 md:hidden"> */}
        //     {/* Top content */}
        // <div className="bg-transparent text-secondaryWhite">
        //     <h2 className={`mb-3 font-semibold ${currentContent.headingClassName} `}>{currentContent.title}</h2>
        //     <p className={`text-[13px] ${currentContent.paragraphClassName}`}>{currentContent.description}</p>
        // </div>

        //     {/* Stepper */}
        //     {isMultiStep && (
        //         <>
        //             <div className="mt-5 flex items-center space-x-3 pb-1 xl:pl-0">
        //                 {steps.map((_, index) => {
        //                     const stepNumber = index + 1;
        //                     const isActive = step >= stepNumber;

        //                     return (
        //                         <span
        //                             key={stepNumber}
        //                             className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold sm:h-10 sm:w-10 md:text-sm ${
        //                                 isActive ? 'bg-white text-primary' : 'bg-transparent text-white'
        //                             }`}
        //                         >
        //                             {stepNumber}
        //                         </span>
        //                     );
        //                 })}
        //             </div>

        //             <div className="text-sm font-extralight text-white">
        //                 Step {step}/{steps.length}
        //             </div>
        //         </>
        //     )}
        // </div>

        <div className="h-[260px] md:hidden">
            <div className="relative z-6 h-auto">
                <img src={images.topFormBg} className="absolute z-6 h-auto w-full object-cover" alt="" />

                {/* Top content */}
                <div className="absolute top-5 left-10 z-7 py-2">
                    <div className="bg-transparent text-secondaryWhite">
                        <h2 className={`mb-3 font-semibold ${currentContent.headingClassName} `}>{currentContent.title}</h2>
                        <p className={`text-[13px] ${currentContent.paragraphClassName}`}>{currentContent.description}</p>
                    </div>

                    {/* Stepper */}
                    {isMultiStep && (
                        <>
                            <div className="mt-5 flex items-center space-x-3 pb-1 xl:pl-0">
                                {steps.map((_, index) => {
                                    const stepNumber = index + 1;
                                    const isActive = step >= stepNumber;

                                    return (
                                        <span
                                            key={stepNumber}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold sm:h-10 sm:w-10 md:text-sm ${
                                                isActive ? 'bg-white text-primary' : 'bg-transparent text-white'
                                            }`}
                                        >
                                            {stepNumber}
                                        </span>
                                    );
                                })}
                            </div>

                            <div className="text-sm font-extralight text-white">
                                Step {step}/{steps.length}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
