import images from '@/constants/image';
import { ReactNode, type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    LeftDesktopContent?: ReactNode;
    mobileTopContent?: ReactNode;
}

// export default function AuthSimpleLayout({ mobileTopContent, LeftDesktopContent, children }: PropsWithChildren<AuthLayoutProps>) {
//     return (
//         <>
//             <div className="h-screen w-full items-start bg-white md:flex lg:bg-transparent dark:bg-gray-900 dark:lg:bg-transparent">
//                 {/* Left Desktop Side*/}
//                 {LeftDesktopContent}

//                 {/* Mobile Pattern Screen and Topcontent */}
//                 {mobileTopContent}

//                 {/* Right Side Desktop and Mobile (Scrollable) */}
//                 <div
//                     style={{
//                         backgroundImage: `url(${images.formBG})`,
//                     }}
//                     className="relative pb-10 md:pb-0 flex w-full bg-white md:h-screen md:w-2/4 lg:justify-end xl:w-full xl:justify-center dark:bg-gray-900"
//                 >
//                     {children}
// {/*
//                     <div className="absolute md:hidden right-0 h-full w-3 bg-deepBlack"> </div>
//                     <div className="absolute md:hidden right-3 top-[51px] rounded-tr-full h-[92%] w-0.5 bg-[#2ABFBB]"> </div> */}
//                 </div>

//                 <div className="h-[200px] rounded-[100%_31%_0%_81%/_56%_0%_45%_0%] bg-deepBlack md:hidden"></div>
//             </div>
//         </>
//     );
// }

export default function AuthSimpleLayout({ mobileTopContent, LeftDesktopContent, children }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <>
            <div className="relative h-screen w-full items-start bg-white md:flex lg:bg-transparent dark:bg-gray-900 dark:lg:bg-transparent">
                {/* Left Desktop Side*/}
                {LeftDesktopContent}

                {/* Mobile Pattern Screen and Topcontent */}
                {mobileTopContent}

                {/* Right Side Desktop and Mobile (Scrollable) */}
                <div
                    style={{
                        backgroundImage: `url(${images.formBG})`,
                    }}
                    className="flex w-full bg-white md:h-screen md:w-2/4 lg:justify-end xl:w-full xl:justify-center dark:bg-gray-900"
                >
                    {children}

              
                </div>

              
            </div>
        </>
    );
}
