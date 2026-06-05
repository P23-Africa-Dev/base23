import { SheetContent } from '@/components/ui/sheet';
import { Star } from 'lucide-react';
import images from '@/constants/image';

type Props = {
    imageSrc: string;
    name: string;
    title: string;
    bio: string;
    experience: string;
    interest: string;
    industry: string;
    companyStage: string;
    keyStrength: string;
    topGoal: string;
    baseLocation: string;
    operatesIn: string;
    reviews: string;
    brnMemberSince: string;
    responseRate: string;
    successfulDealsRate: string;
};

const formatStringData = (value?: string, fallback = 'Not Specified') =>
    value && value.trim() ? value : fallback;

export default function MobileProfileSidebar({
    imageSrc,
    name,
    title,
    bio,
    experience,
    interest,
    industry,
    companyStage,
    keyStrength,
    topGoal,
    baseLocation,
    operatesIn,
    reviews,
    brnMemberSince,
    responseRate,
    successfulDealsRate,
}: Props) {
    return (
        <div id="sidebar-chat-profile">
            <SheetContent
                side="right"
                className="
                    w-[390px] max-w-[280px]
                    border-none bg-transparent
                    sm:max-w-md
                    md:w-auto md:max-w-[700px]
                    lg:max-w-[710px]
                    [&>button.absolute.right-4.top-4]:hidden  h-[77vh] top-[110px]
                "
            >
                <div className="h-full w-full overflow-y-scroll md:overflow-hidden pl-2 rounded-3xl bg-white md:p-4 shadow-lg md:flex md:flex-row">
                    
                    {/* ================= LEFT COLUMN ================= */}
                    <div className="no-scrollbar flex w-full flex-col overflow-y-auto md:overflow-hidden rounded-l-2xl bg-[#A7D5DD] py-4 md:py-0 pl-3 md:pl-6 md:h-auto md:w-[43%] md:bg-[#A7D5DD] shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)] md:shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]  mt-2">
                        
                        {/* Top Area */}
                        <div className="flex mt-1 md:mt-0 gap-x-3 md:gap-x-0 items-start md:items-center  md:flex-col ">
                            <div className="relative md:mt-10 flex w-20 h-20  lg:w-42 lg:h-42 items-center justify-center rounded-full bg-gradient-to-tr from-[#325A64] to-[#AC7CEE] p-1 shadow-[3px_5px_4px_2px_rgba(0,0,0,0.25)]">
                                <div
                                    style={{ backgroundImage: `url(${imageSrc})` }}
                                    className="w-18 h-18 md:w-25 md:h-25 lg:w-40 lg:h-40 rounded-full bg-cover bg-top"
                                />
                            </div>

                            <div className="flex flex-col md:items-center md:justify-center items-start">
                                <div className="text-darkBlue mt-2 md:mb-2 lg:mt-10 text-left md:text-center">
                                    <h1 className="text-[14.5px] leading-3.5 font-extrabold  lg:text-xl lg:max-w-[165px]">
                                        {formatStringData(name, 'Unknown User')}
                                    </h1>
                                    <p className="text-[13.3px] lg:text-sm ">
                                        {formatStringData(title, 'Position Not Specified')}
                                    </p>
                                </div>

                                <p className="text-[8.2px] leading-3 md:text-xs font-medium text-darkBlue mt-1 lg:px-8 md:text-center">
                                    {/* {formatStringData(topGoal, 'Goals Not Specified')} */}
                                    Currently seeking Series A investors ($3M target) to expand off-grid solar solutions in secondary African cities.
                                </p>

                                <div className="hidden md:flex items-center space-x-2 mt-4">
                                    <p className="text-base font-bold underline">{formatStringData(reviews, '0')}</p>
                                    <Star className="h-5 w-5 fill-[#978FED] text-[#978FED]" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Area */}
                        <div className=" md:mt-14 md:mb-26">
                            <div className="space-y-2 hidden md:block">
                                <h5 className="text-xs font-bold">
                                    Base Location
                                    <span className="block font-normal">
                                        {formatStringData(baseLocation)}
                                    </span>
                                </h5>
                                <h5 className="text-xs font-bold">
                                    Operates In
                                    <span className="block font-normal">
                                        {formatStringData(operatesIn)}
                                    </span>
                                </h5>
                            </div>

                            <div className="mt-4 ml-5 flex items-start space-x-2">
                                <button className="w-9 h-9 rounded-full bg-darkBlue shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]">
                                    <img src={images.userMailVoice} className="w-5 h-5 mx-auto" />
                                </button>
                                <button className="w-9 h-9 rounded-full bg-darkBlue shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]">
                                    <img src={images.userMessage} className="w-5 h-5 mx-auto" />
                                </button>
                                <button className="md:w-[40%] rounded-full bg-darkBlue py-2.5 px-4 text-[9.4px] font-semibold text-[#D7F6EC] shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]">
                                    Request Contact
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN ================= */}
                    <div className="bio-info-scrollbar w-full overflow-y-auto p-3  pt-7 md:w-[57%] md:p-6">
                        <div className="text-darkBlue pl-2">
                            <h2 className="text-sm font-extrabold">Bio</h2>
                            <p className="mt-1 text-[9.6px] font-medium">
                                {/* {formatStringData(bio, 'No Bio Available')} */}
                                Seasoned renewable energy executive with 8 years of experience building solar infrastructure across East and West Africa. Founded GreenEnergy Africa in 2018, scaling to $5M annual revenue by establishing distribution partnerships in 3 countries. Passionate about bridging Africa's energy gap while delivering investor returns. Fluent in English and business-level French.
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-y-4 pl-2 text-[10px] text-darkBlue">
                            <Info label="Experience" value={experience} />
                            <Info label="Interest" value={interest} />
                            <Info label="Industry" value={industry} />
                            <Info label="Company Stage" value={companyStage} />
                            <Info full label="Key Strength" value={keyStrength} />
                            <Info full label="Top Goal" value={topGoal} />
                        </div>

                        {/* Activity */}
                        <div className="mt-6 rounded-br-4xl bg-darkBlue px-5 py-4 text-secondaryWhite shadow-lg">
                            <h2 className="text-sm font-bold">Activity & Reputation</h2>
                            <div className="mt-4 space-y-4 text-[10px]">
                                <InfoLight label="BRN Member Since" value={brnMemberSince} />
                                <InfoLight label="Response Rate" value={responseRate} />
                                <InfoLight label="Successful Deals Rate" value={successfulDealsRate} />
                            </div>

                            <a href="#" className="mt-4 block text-xs italic underline">
                                View Reviews
                            </a>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </div>
    );
}

/* ---------- Helpers ---------- */

const Info = ({ label, value, full }: any) => (
    <div className={full ? 'col-span-2' : ''}>
        <p className="font-bold">{label}</p>
        <p className="font-normal">{value || 'Not Specified'}</p>
    </div>
);

const InfoLight = ({ label, value }: any) => (
    <div>
        <p className="font-bold">{label}</p>
        <p className="font-light">{value || 'Not Specified'}</p>
    </div>
);
