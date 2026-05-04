// import images from '@/constants/image';
// import { Star } from 'lucide-react';

// interface UserCardProps {
//     name: string;
//     location: string;
//     title: string;
//     industry: string;
//     rating: number;
//     imageSrc: string;
// }

// const UserCard: React.FC<UserCardProps> = ({ name, location, title, industry, rating, imageSrc, }) => {
//     return (
//         <div className="relative flex items-start space-x-4 border-b  border-b-gray/60  lg:last:border-b last:border-b-0 bg-transparent p-4 lg:items-center lg:border-b-3 lg:border-b-gray">

//             <div className="relative rounded-l-3xl bg-transparent lg:h-[100px] lg:w-[100px] lg:rounded-l-xl ">
//                 <div
//                     style={{
//                         backgroundImage: `url(${imageSrc})`,
//                     }}
//                     className="aboslute left-0 h-[100px] w-[100px] max-w-full overflow-hidden rounded-l-xl bg-cover bg-top bg-no-repeat lg:h-full lg:w-[90%]"
//                 ></div>
//             </div>
//             <div className="grid w-full lg:pr-8 ">
//                 <div className="flex  items-center justify-between">
//                     <div>
// <h3 className="mb-1 text-[11px] font-semibold text-white lg:mb-0 xl:text-[14.6px] lg:text-darkBlue/95">{name}</h3>
//                         <div className="flex items-center gap-1 text-darkBlue">
//                             <img src={images.desktopLocation} className="hidden h-4 w-4 lg:block" alt="" />
//                             <img src={images.cardlocation} className="h-3 w-3 lg:hidden" alt="" />
//                             <p className="text-[10px] font-extralight text-white md:text-[11px] lg:font-normal lg:text-darkBlue/80">{location}</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center space-x-2 ">
//                         <span className="text-base font-light text-white lg:text-base lg:font-medium lg:text-gray-600">{rating}</span>
//                         <Star className="h-5 w-5 fill-darkGreen font-bold text-darkGreen" />
//                     </div>
//                 </div>
//                 <div className="mt-5 flex    justify-between text-sm">
//                     <div className='flex flex-col flex-wrap lg:w-[120px] xl:w-[200px] '>
{
    /* <p className="text-[11px] font-semibold text-darkGreen md:text-sm">Title</p>
<p className="text-[10px] font-semibold lg:font-extrabold text-white md:text-[11px] lg:text-darkBlue">{title}</p> */
}
//                     </div>
//                     <div className='flex flex-col items-end  text-right w-[50%]'>
//                         <p className="text-[10px]  font-semibold text-darkGreen md:text-xs">Industry</p>
//                         <p className="text-[9px] font-semibold lg:font-extrabold text-white md:text-[11px] lg:text-darkBlue"> {industry}</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserCard;

import images from '@/constants/image';
import { formatText } from '@/utils/format-character';
import { Star } from 'lucide-react';

interface UserCardProps {
    name: string;
    location: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
}

const UserCard: React.FC<UserCardProps> = ({ name, location, title, industry, rating, imageSrc }) => {
    return (
        <div className="relative mx-3 flex items-start space-x-4 border-b border-b-gray/20 bg-transparent p-0 pt-4 pb-3 lg:items-center lg:border-b-3 lg:border-b-gray lg:last:border-b">
            <div className="relative h-[63px] w-[63px] rounded-l-3xl bg-transparent lg:h-[100px] lg:w-[100px] lg:rounded-l-xl">
                <div
                    style={{
                        backgroundImage: `url(${imageSrc})`,
                    }}
                    className="aboslute left-0 h-[66px] w-[83px] max-w-full overflow-hidden rounded-l-xl bg-cover bg-top bg-no-repeat lg:h-[100px] lg:w-[100px]"
                ></div>
            </div>
            <div className="grid w-full grid-cols-2 gap-6">
                <div className="flex flex-col gap-4.5">
                    <div className="">
                        <h3 className="mb-1 text-[10.5px] font-semibold text-white lg:mb-0 lg:hidden lg:text-darkBlue/95 xl:text-[14.6px]">
                            {' '}
                            {formatText(`${name}`, 12)}
                        </h3>
                        {/* Desktop */}
                        <h3 className="mb-1 hidden text-[11px] font-semibold text-white lg:mb-0 lg:mb-0.5 lg:block lg:text-darkBlue/95 xl:text-[14.6px]">
                            {name}
                        </h3>

                        <div className="flex items-center gap-1 text-darkBlue">
                            <img src={images.desktopLocation} className="hidden h-3.5 w-3.5 lg:block" alt="" />
                            <img src={images.cardlocation} className="-mt-1 h-3 w-3 lg:hidden" alt="" />
                            <p className="-mt-1 text-[8.5px] font-extralight text-white md:text-[11px] lg:font-normal lg:text-darkBlue/80">
                                {' '}
                                {formatText(`${location}`, 17)}
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="-mt-1.5 flex flex-col flex-wrap lg:w-[120px] xl:w-[200px]">
                        <p className="text-[7.5px] font-semibold text-darkGreen md:text-[10.5px]">Title</p>
                        <p className="text-[7.5px] font-semibold text-white md:text-[8px] lg:hidden lg:font-extrabold lg:text-darkBlue">
                            {' '}
                            {formatText(`${title}`, 12)}
                        </p>
                        <p className="hidden text-[7.5px] font-semibold text-white md:text-[10.5px] lg:block lg:font-extrabold lg:text-darkBlue">
                            {title}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-y-8">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-light text-white lg:text-base lg:font-medium lg:text-gray-600">3.7</span>
                        <Star className="h-4 w-4 fill-darkGreen font-bold text-darkGreen" />
                    </div>
                    <div className="-mt-1.5 flex flex-col text-left">
                     
                        <p className="text-[7.5px] font-semibold text-darkGreen md:text-[10.5px]">Industry</p>
                        <p className="text-[7.5px] font-semibold text-white md:text-[8px] lg:hidden lg:font-extrabold lg:text-darkBlue">
                            {' '}
                            {formatText(`${industry}`, 12)}
                        </p>
                        <p className="hidden text-[7.5px] font-semibold text-white md:text-[10.5px] lg:block lg:font-extrabold lg:text-darkBlue">
                            {industry}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
