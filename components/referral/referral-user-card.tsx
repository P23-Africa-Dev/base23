import images from '@/constants/image';
import { Star } from 'lucide-react';

interface ReferralUserCardProps {
    name: string;
    location: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
}

const ReferralUserCard: React.FC<ReferralUserCardProps> = ({ name, location, title, industry, rating, imageSrc, }) => {
    return (
        <div className="relative flex items-start space-x-4 border-b  border-b-gray/60  lg:last:border-b last:border-b-0 bg-transparent p-1 lg:items-center lg:border-b-3 lg:border-b-gray">

            <div className="relative rounded-l-3xl bg-transparent lg:h-[80px] lg:w-[80px] lg:rounded-l-xl">
                <div className="relative h-[100px] w-[100px] max-w-full overflow-hidden rounded-l-xl lg:h-full lg:w-[90%]">
                    <img
                        src={imageSrc}
                        alt={name}
                        className="h-full w-full object-cover object-top"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=ffffff&size=200`;
                        }}
                    />
                </div>
            </div>
            <div className="grid  gap-2 w-full lg:pr-8 ">
                <div className="flex  items-center  justify-between">
                    <div>
                        <h3 className="mb-1 text-[11px] font-semibold text-white lg:mb-0 xl:text-[13.6px] tracking-wide lg:text-darkBlue/95">{name}</h3>
                        <div className="flex items-center gap-1 text-darkBlue">
                            <img src={images.desktopLocation} className="hidden h-3 w-3 lg:block" alt="" />
                            <p className="text-[9px] font-extralight text-white  lg:font-normal lg:text-darkBlue/80">{location}</p>
                        </div>
                    </div>
                    <div className="flex items-center  pr-10 space-x-2 ">
                        <span className="text-base font-light text-white lg:text-base lg:font-medium lg:text-gray-600">{rating}</span>
                        <Star className="h-5 w-5 fill-darkGreen font-bold text-darkGreen" />
                    </div>
                </div>
                <div className=" flex    justify-between text-sm">
                    <div className='flex flex-col flex-wrap lg:w-[120px] xl:w-[200px] '>
                        <p className="text-[10px] font-semibold text-darkGreen ">Title</p>
                        <p className="text-[9.5px] font-semibold lg:font-extrabold text-white  lg:text-darkBlue">{title}</p>
                    </div>
                    <div className='flex flex-col items-end  text-right w-[50%]'>
                        <p className="text-[10px]  font-semibold text-darkGreen md:text-xs">Industry</p>
                        <p className="text-[9px] font-semibold lg:font-extrabold text-white  lg:text-darkBlue"> {industry}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralUserCard;
