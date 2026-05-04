// import images from '@/constants/image';
// import { Star } from 'lucide-react';

// interface DirectoryPendingProps {
//     name: string;
//     location: string;
//     title: string;
//     industry: string;
//     rating: number;
//     imageSrc: string;
//     userId?: number;
//     direction?: 'incoming' | 'outgoing';
//     onAccept?: (userId: number) => void;
//     onReject?: (userId: number) => void;
//     loadingUserId?: number | null;
// }

// const DirectoryMobilePendingList: React.FC<DirectoryPendingProps> = ({
//     name,
//     location,
//     title,
//     industry,
//     rating,
//     imageSrc,
//     userId,
//     direction = 'incoming',
//     onAccept,
//     onReject,
//     loadingUserId,
// }) => {
//     const isLoading = loadingUserId === userId;
//     const isIncoming = direction === 'incoming';

//     return (
//         <div className="relative mx-3 flex items-start space-x-4 border-b border-b-gray/20 bg-transparent p-0 py-3 lg:items-center lg:border-b-3 lg:border-b-gray lg:last:border-b">
//             {/* <div className="relative flex w-full cursor-pointer items-start space-x-4 rounded-[26px] border-b border-b-gray/60 bg-white p-4 pr-10 shadow-[0px_-2px_2px_-3px_rgba(0,0,0,0.3),5px_5px_2px_-3px_rgba(0,0,0,0.3)] last:border-b-0 lg:items-center lg:border-b-3 lg:border-b-gray lg:last:border-b"> */}
//             <div className="flex w-[70%]">
//                 <div className="flex w-[397px] gap-x-10">
//                     <div className="relative rounded-l-3xl bg-transparent lg:h-[100px] lg:w-[100px] lg:rounded-l-xl">
//                         <div
//                             style={{
//                                 backgroundImage: `url(${imageSrc})`,
//                             }}
//                             className="aboslute left-0 h-[100px] w-[100px] max-w-full overflow-hidden rounded-l-xl bg-cover bg-top bg-no-repeat lg:h-full lg:w-[90%]"
//                         ></div>
//                     </div>
//                     <div className="flex flex-col items-start justify-between">
//                         <div>
//                             <h3 className="mb-1 text-sm font-semibold text-white lg:mb-0 lg:text-darkBlue xl:text-[16px]">{name}</h3>
//                             <div className="flex items-center gap-1 text-darkBlue">
//                                 <div className="relative h-4 w-4">
//                                     <img src={images.directoryListLocation} className="absolute object-cover" alt="" />
//                                 </div>
//                                 <p className="text-[10px] font-extralight text-white md:text-xs lg:font-medium lg:text-darkBlue/70">{location}</p>
//                             </div>
//                         </div>

//                         <div className="flex flex-col flex-wrap lg:w-[120px] xl:w-[200px]">
//                             <p className="text-[11px] font-semibold text-darkGreen md:text-sm">Title</p>
//                             <p className="text-[10px] font-semibold text-white md:text-sm lg:font-bold lg:text-darkBlue">{title}</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="flex flex-col justify-between text-sm">
//                     <div className="flex w-[138px] items-center space-x-2">
//                         <span className="text-base font-light text-white lg:font-medium lg:text-gray-600">{rating}</span>
//                         <Star className="h-5 w-5 fill-darkGreen font-bold text-darkGreen" />
//                     </div>

//                     <div className="flex flex-col flex-wrap">
//                         <p className="text-[10px] font-semibold text-darkGreen md:text-sm">Industry</p>
//                         <p className="text-[9px] font-semibold text-white md:text-sm lg:font-bold lg:text-darkBlue">{industry}</p>
//                     </div>
//                 </div>
//             </div>

//             <div className="flex items-center gap-x-4">
//                 {isIncoming ? (
//                     <>
//                         {/* Decline Button - Simple Border and Text */}
//                         <button
//                             onClick={() => userId && onReject && onReject(userId)}
//                             disabled={isLoading || !userId || !onReject}
//                             title="Reject Connection"
//                             className="rounded-full border border-[#193E47] px-5 py-1.5 text-sm font-medium text-[#193E47] transition-all duration-200 hover:bg-[#193E47] hover:text-white disabled:opacity-50"
//                         >
//                             {isLoading ? (
//                                 <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-[#193E47] border-t-transparent"></div>
//                             ) : (
//                                 'Decline'
//                             )}
//                         </button>

//                         {/* Accept Button - Gradient Border and Gradient Text */}
//                         <button
//                             onClick={() => userId && onAccept && onAccept(userId)}
//                             disabled={isLoading || !userId || !onAccept}
//                             title="Accept Connection"
//                             className="relative rounded-full bg-gradient-to-r from-[#DF87B1] via-[#CD6BD0] to-[#BE51EA] p-[1px] text-sm font-medium transition-all duration-200 disabled:opacity-50"
//                         >
//                             <span className="block rounded-full bg-white px-5 py-1.5">
//                                 {isLoading ? (
//                                     <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-[#BE51EA] border-t-transparent"></div>
//                                 ) : (
//                                     <span className="bg-gradient-to-r from-[#DF87B1] via-[#CD6BD0] to-[#BE51EA] bg-clip-text text-transparent">
//                                         Accept
//                                     </span>
//                                 )}
//                             </span>
//                         </button>
//                     </>
//                 ) : (
//                     <button
//                         onClick={() => userId && onReject && onReject(userId)}
//                         disabled={isLoading || !userId || !onReject}
//                         title="Revoke Connection Request"
//                         className="rounded-full border border-[#193E47] px-5 py-1.5 text-sm font-medium text-[#193E47] transition-all duration-200 disabled:opacity-50"
//                     >
//                         {isLoading ? (
//                             <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-[#193E47] border-t-transparent"></div>
//                         ) : (
//                             'Revoke'
//                         )}
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default DirectoryMobilePendingList;

import images from '@/constants/image';
import { formatText } from '@/utils/format-character';
import { Star } from 'lucide-react';

interface DirectoryMobilePendingListProps {
    name: string;
    location: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
}

const DirectoryMobilePendingList: React.FC<DirectoryMobilePendingListProps> = ({ name, location, title, industry, rating, imageSrc }) => {
    return (
        <div className="relative mx-3 flex items-start space-x-4 border-b border-b-gray/20 bg-transparent pb-3  lg:items-center lg:border-b-3 lg:border-b-gray lg:last:border-b">
            <div className="relative h-[63px] w-[63px] rounded-l-3xl bg-transparent lg:h-[100px] lg:w-[100px] lg:rounded-l-xl">
                <div
                    style={{
                        backgroundImage: `url(${imageSrc})`,
                    }}
                    className="aboslute left-0 h-[66px] w-[83px] max-w-full overflow-hidden rounded-l-xl bg-cover bg-top bg-no-repeat lg:h-full lg:w-[90%]"
                ></div>
            </div>
            <div className="grid w-full grid-cols-2 gap-6">
                <div className="flex flex-col gap-5">
                    <div className="">
                        <h3 className="mb-1 text-[10px] font-semibold text-white lg:mb-0 lg:text-darkBlue/95 xl:text-[14.6px]">
                            {' '}
                            {formatText(`${name}`, 12)}
                        </h3>
                        <div className="flex items-center gap-1 text-darkBlue">
                            <img src={images.desktopLocation} className="hidden h-4 w-4 lg:block" alt="" />
                            <img src={images.cardlocation} className="h-3 w-3 -mt-1 lg:hidden" alt="" />
                            <p className="text-[8.2px] font-extralight -mt-1 text-white md:text-[11px] lg:font-normal lg:text-darkBlue/80">
                                {' '}
                                {formatText(`${location}`, 15)}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-7">
                        {/* Title */}
                        <div className="flex flex-col flex-wrap lg:w-[120px] xl:w-[200px]">
                            <p className="text-[7px] font-semibold text-darkGreen md:text-[8px]">Title</p>
                            <p className="text-[7px] font-semibold text-white md:text-[8px] lg:font-extrabold lg:text-darkBlue">
                                {' '}
                                {formatText(`${title}`, 3)}
                            </p>
                        </div>

                        <div className="flex w-full flex-col text-left">
                            <p className="text-[7px] font-semibold text-darkGreen md:text-[8px]">Industry</p>
                            <p className="text-[7px] font-semibold text-white md:text-[8px] lg:font-extrabold lg:text-darkBlue">
                                {' '}
                                {formatText(`${industry}`, 3)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-y-6">
                    <div className="flex gap-x-2">
                        {/* Decline */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className="relative rounded-full bg-gradient-to-r from-[#DF87B1] via-[#CD6BD0] to-[#BE51EA] p-[1px]"
                        >
                            <span className="flex items-center justify-center rounded-full bg-deepBlack px-3.5 py-1.5">
                                <span className="bg-gradient-to-r from-[#DF87B1] via-[#CD6BD0] to-[#BE51EA] bg-clip-text text-[8.5px] font-light text-transparent">
                                    Decline
                                </span>
                            </span>
                        </button>

                        {/* Accept */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className="rounded-full border border-[#27E6A7] px-3.5 py-1.5 text-[8.5px] font-light text-[#27E6A7]"
                        >
                            Accept
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-light text-white lg:text-base lg:font-medium lg:text-gray-600">{rating}</span>
                        <Star className="h-4 w-4 fill-darkGreen font-bold text-darkGreen" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectoryMobilePendingList;
