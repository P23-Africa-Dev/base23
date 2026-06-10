import images from '@/constants/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { createPortal } from 'react-dom';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
};

export default function MessageProfileOverlay({ isOpen, onClose, user }: Props) {
    if (!isOpen || !user) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Slide container */}
                    <motion.div
                        className="pointer-events-none fixed inset-0 z-[10000] flex items-start justify-center pt-26"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        {/* Card Wrapper */}
                        <motion.div
                            className="pointer-events-auto w-full max-w-[680px] translate-x-26 px-6"
                            initial={{ opacity: 0, y: 40, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.96 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="overflow-hidden rounded-[40px] bg-white p-5 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)] md:flex">
                                {/* LEFT PROFILE COLUMN */}
                                <div className="flex flex-col items-center rounded-tl-[40px] rounded-bl-[40px] bg-[#A7D5DD] px-6 py-5 text-center shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)] md:w-[43%]">
                                    <div className="relative mt-2 h-[189px] w-[199px] rounded-full bg-gradient-to-tr from-[#325A64] to-[#AC7CEE] p-2 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)]">
                                        <div
                                            style={{
                                                backgroundImage: `url(${user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`})`,
                                            }}
                                            className="h-full w-full rounded-full bg-cover bg-top"
                                        />
                                    </div>

                                    <h2 className="mt-10 text-[21px] leading-4.5 font-extrabold text-darkBlue">Thabo Molefe</h2>
                                    {/* <h2 className="mt-5 text-2xl font-extrabold text-darkBlue">{user.name}</h2> */}
                                    <p className="text-[14px] text-darkBlue">CTO AfriLaw</p>
                                    {/* <p className="text-xs text-darkBlue">{user.title || 'Position Not Specified'}</p> */}

                                    <p className="mt-3 max-w-[220px] text-[10px] leading-3 font-medium text-darkBlue">
                                        “Currently seeking Series A investors ($3M target) to expand off-grid solar solutions in secondary African
                                        cities.” 
                                    </p>
                                    {/* <p className="mt-3 max-w-xs text-xs text-darkBlue italic">{user.top_goal || 'Goals Not Specified'}</p> */}

                                    <div className="mt-4 flex items-center gap-1">
                                        <span className="text-sm font-bold text-darkBlue underline">20+ Network</span>
                                        {/* <span className="font-bold">{user.reviews || 0}</span> */}
                                        <Star className="ml-1 h-5 w-5 fill-[#978FED] text-[#978FED]" />
                                    </div>

                                    <div className="mt-4 space-y-1 text-xs text-darkBlue">
                                        <p>
                                            <span className="text-xs font-bold">
                                                Operates in: <br />
                                            </span>{' '}
                                            <span className="text-[11px]">Nigeria, Ghana, Kenya</span>
                                            {/* <span className="font-bold">Operates in: <br /></span> {user.operates_in || '—'} */}
                                        </p>
                                    </div>
                                </div>

                                {/* RIGHT DETAILS COLUMN */}
                                <div className="max-h-[70vh] overflow-y-auto pt-10 pr-3 pb-4 pb-5 pl-5 text-darkBlue md:w-[57%]">
                                    <h3 className="text-sm font-extrabold">Bio</h3>
                                    <p className="mt-1 text-[9.5px] font-medium">
                                        Seasoned renewable energy executive with 8 years of experience building solar infrastructure across East and
                                        West Africa. Founded GreenEnergy Africa in 2018, scaling to $5M annual revenue by establishing distribution
                                        partnerships in 3 countries. Passionate about bridging Africa&apos;s energy gap while delivering investor returns.
                                        Fluent in English and business-level French.
                                    </p>
                                    {/* <p className="mt-1 text-xs">{user.bio || 'No Bio Available'}</p> */}

                                    {/* <div className="mt-6 grid grid-cols-2 gap-y-4 text-xs">
                                        <Info label="Experience" value={user.experience} />
                                        <Info label="Interest" value={user.interest} />
                                        <Info label="Industry" value={user.industry} />
                                        <Info label="Company Stage" value={user.company_stage} />
                                        <div className="col-span-2">
                                            <Info label="Key Strength" value={user.key_strength} />
                                        </div>
                                        <div className="col-span-2">
                                            <Info label="Top Goal" value={user.top_goal} />
                                        </div>
                                    </div> */}

                                    <div className="mt-6 grid grid-cols-2 gap-y-4 text-[10px] text-darkBlue">
                                        <div>
                                            <p className="font-bold">Experience</p>
                                            <p className="font-normal">8 years</p>
                                        </div>
                                        <div>
                                            <p className="font-bold">Interest</p>
                                            <p className="font-normal">Strategy & Finance </p>
                                        </div>
                                        <div>
                                            <p className="font-bold">Industry</p>
                                            <p className="font-normal">Solar Energy</p>
                                        </div>
                                        <div>
                                            <p className="font-bold">Company Stage</p>
                                            <p className="font-normal">Growth ($5M annual revenue)</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="font-bold">Key Strength</p>
                                            <p className="font-normal">East Africa distribution networks</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="font-bold">Top Goal</p>
                                            <p className="font-normal">Seeking $3M Series A investors</p>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="mt-7 flex w-full items-start space-x-2">
                                        <button className="flex h-9 w-9 items-center justify-center gap-2 rounded-full bg-darkBlue p-2 whitespace-nowrap text-white shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] lg:h-9 lg:w-9">
                                            <img src={images.userMailVoice} className="h-5 w-6 lg:h-5 lg:w-5" alt="" />
                                        </button>
                                        <button className="flex h-9 w-9 items-center justify-center gap-2 rounded-full bg-darkBlue p-2 whitespace-nowrap text-white shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)] lg:h-9 lg:w-9">
                                            <img src={images.userMessage} className="h-5 w-6 lg:h-5 lg:w-5" alt="" />
                                        </button>

                                        <button className="-mr-4 flex items-center justify-center rounded-full bg-darkBlue px-4 py-3 text-[9px] font-semibold text-[#D7F6EC] shadow-[0px_10px_16px_-10px_rgba(0,0,0,0.8)]">
                                            Request Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.getElementById('overlay-root')!,
    );
}
