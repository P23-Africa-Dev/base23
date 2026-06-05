import images from '@/constants/image';
import { formatText } from '@/utils/format-character';
import { Star } from 'lucide-react';

interface UserMessageCardProps {
    name: string;
    location: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
}

const UserMessageCard: React.FC<UserMessageCardProps> = ({ name, location, title, industry, rating, imageSrc }) => {
    return (
        <div className="relative flex items-start space-x-4 border-b border-b-gray/60 bg-transparent p-0 py-4 last:border-b-0 lg:items-center lg:border-b-1 lg:border-b-gray-200 lg:p-4 lg:last:border-b">
            <div className="relative h-[63px] w-[63px] rounded-l-3xl bg-transparent lg:h-[100px] lg:w-[100px] lg:rounded-l-xl">
                <div
                    style={{
                        backgroundImage: `url(${imageSrc})`,
                    }}
                    className="aboslute left-0 h-[66px] w-[83px]  max-w-full overflow-hidden rounded-l-xl bg-cover bg-top bg-no-repeat lg:h-full lg:w-[90px]"
                ></div>
            </div>

            <div className="grid w-full lg:pr-8">
                <div className="flex items-center justify-between">
                    <div>
                        {/* Desktop */}
                        <h3 className="mb-1 hidden text-[10.5px] font-semibold text-white lg:mb-0 md:block lg:text-darkBlue/95 xl:text-[14.6px]">
                            {' '}
                            {formatText(`${name}`, 18)}
                        </h3>

                        {/* Mobile */}
                        <h3 className="mb-1 text-[10.5px] font-semibold text-white lg:mb-0 md:hidden lg:text-darkBlue/95 xl:text-[14.6px]">
                            {' '}
                            {formatText(`${name}`, 14)}
                        </h3>

                        <div className="-mt-1 flex items-center gap-1 text-darkBlue lg:-mt-0">
                            <img src={images.desktopLocation} className="hidden h-3.5 w-3.5 lg:block" alt="" />
                            <img src={images.cardlocation} className="h-3 w-3 lg:hidden" alt="" />

                            {/* Desktop */}
                            <p className="hidden text-[8.5px] font-extralight text-white md:text-[11px] md:block lg:font-normal lg:text-darkBlue/80">
                                {' '}
                                {formatText(`${location}`, 27)}
                            </p>

                            {/* Mobile */}
                            <p className="text-[8.5px] font-extralight text-white md:text-[11px] md:hidden lg:font-normal lg:text-darkBlue/80">
                                {' '}
                                {formatText(`${location}`, 17)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-light text-white lg:text-base lg:font-medium lg:text-gray-600">{rating}</span>
                        <Star className="h-4 w-4 fill-darkGreen font-bold text-darkGreen lg:h-5 lg:w-5" />
                    </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                    <div className="flex flex-col flex-wrap items-start lg:w-[120px] xl:w-[200px]">
                        <p className="text-[7.5px] font-semibold text-darkGreen md:text-[10px]">Title</p>
                        <p className="text-[7.5px] font-semibold text-white md:text-[10px] lg:font-extrabold lg:text-darkBlue">
                            {formatText(`${title}`, 12)}
                        </p>
                    </div>
                    <div className="flex w-[50%] flex-col items-end text-right">
                        <p className="text-[7.5px] font-semibold text-darkGreen md:text-xs">Industry</p>
                        <p className="text-[7.5px] font-semibold text-white md:text-[10px] lg:font-extrabold lg:text-darkBlue"> {industry}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMessageCard;
