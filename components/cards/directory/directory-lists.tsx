import images from '@/constants/image';
import { formatText } from '@/utils/format-character';
import { Star } from 'lucide-react';

interface DirectoryListProps {
    name: string;
    location: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
}
const DirectoryList: React.FC<DirectoryListProps> = ({ name, location, title, industry, rating, imageSrc }) => {
    return (
        <div className="relative flex cursor-pointer items-start space-x-4 rounded-[26px] border-b border-b-gray/60 bg-white p-4 shadow-[0px_-2px_2px_-3px_rgba(0,0,0,0.3),5px_5px_2px_-3px_rgba(0,0,0,0.3)] last:border-b-0 lg:items-center lg:border-b-3 lg:border-b-gray lg:last:border-b">
            <div className="relative rounded-l-3xl bg-transparent lg:h-[100px] lg:w-[100px] lg:rounded-l-xl">
                <div
                    style={{
                        backgroundImage: `url(${imageSrc})`,
                    }}
                    className="aboslute left-0 h-[100px] w-[100px] max-w-full overflow-hidden rounded-l-xl bg-cover bg-top bg-no-repeat lg:h-full lg:w-[90%]"
                ></div>
            </div>
            <div className="lg:-pr-6 flex-1 xl:pr-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="mb-1 text-sm font-semibold text-darkBlue lg:mb-0 xl:text-[16px]">{name}</h3>
                        <div className="flex items-center gap-1 text-darkBlue">
                            <div className="relative h-4 w-4">
                                <img src={images.directoryListLocation} className="absolute object-cover" alt="" />
                            </div>
                            <p className="text-[10px] font-extralight text-darkBlue/70 md:text-xs lg:font-medium">{location}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-base font-light text-gray-600 lg:text-[16px] lg:font-medium">{rating}</span>
                        <Star className="h-5 w-5 fill-darkGreen font-bold text-darkGreen" />
                    </div>
                </div>
                <div className="mt-5 flex justify-between text-sm">
                    <div className="flex flex-col flex-wrap lg:w-[120px] xl:w-[200px] lg:mt-2">
                        <p className="text-[11px] font-semibold text-darkGreen md:text-sm">Title</p>
                        <p className="text-[10px] font-semibold text-darkBlue md:text-sm lg:font-bold">   {formatText(`${title}`, 15)}</p>
                    </div>
                    <div className="flex flex-col flex-wrap">
                        <p className="text-[10px] font-semibold text-darkGreen md:text-sm">Industry</p>
                        <p className="text-[9px] font-semibold text-darkBlue md:text-sm lg:font-bold">{industry}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectoryList;
