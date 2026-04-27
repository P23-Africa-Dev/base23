import images from '@/constants/image';
import {  formatText } from '@/utils/format-character';
import { Star } from 'lucide-react';

interface DirectoryMobileListProps {
    name: string;
    location: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
}

const DirectoryMobileList: React.FC<DirectoryMobileListProps> = ({ name, location, title, industry, rating, imageSrc }) => {
    return (
        <div className="relative mx-3 flex items-start  space-x-4 border-b border-b-gray/20 bg-transparent p-0  pb-3 lg:items-center lg:border-b-3 lg:border-b-gray lg:last:border-b">
            <div className="relative h-[63px] w-[63px] rounded-l-3xl bg-transparent lg:h-[100px] lg:w-[100px] lg:rounded-l-xl">
                <div
                    style={{
                        backgroundImage: `url(${imageSrc})`,
                    }}
                    className="aboslute left-0 h-[66px] w-[83px] max-w-full overflow-hidden rounded-l-xl bg-cover bg-top bg-no-repeat lg:h-full lg:w-[90%]"
                ></div>
            </div>
            <div className="grid gap-6 grid-cols-2 w-full ">
                <div className="flex flex-col gap-4.5 ">
                    <div className="">
                        <h3 className="mb-1 text-[10.5px] font-semibold text-white lg:mb-0 lg:text-darkBlue/95 xl:text-[14.6px]"> {formatText(`${name}`, 12)}</h3>
                   
                        <div className="flex items-center gap-1 text-darkBlue">
                            <img src={images.desktopLocation} className="hidden h-4 w-4 lg:block" alt="" />
                            <img src={images.cardlocation} className="h-3 w-3 -mt-1 lg:hidden" alt="" />
                            <p className="text-[8.5px] -mt-1 font-extralight text-white md:text-[11px] lg:font-normal lg:text-darkBlue/80">  {formatText(`${location}`, 17)}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="flex  flex-col flex-wrap lg:w-[120px] xl:w-[200px]">
                        <p className="text-[7.5px] font-semibold text-darkGreen md:text-[8px]">Title</p>
                        <p className="text-[7.5px] font-semibold text-white md:text-[8px] lg:font-extrabold lg:text-darkBlue"> {formatText(`${title}`, 12)}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-y-8 items-end ">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-light text-white lg:text-base lg:font-medium lg:text-gray-600">{rating}</span>
                        <Star className="h-4 w-4 fill-darkGreen font-bold text-darkGreen" />
                    </div>
                    <div className="flex  flex-col text-left">
                        <p className="text-[7.5px] font-semibold text-darkGreen md:text-[8px]">Industry</p>
                        <p className="text-[7.5px] font-semibold text-white md:text-[8px] lg:font-extrabold lg:text-darkBlue"> {formatText(`${industry}`, 18)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectoryMobileList;
