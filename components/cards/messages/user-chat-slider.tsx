import { formatCharacters, formatNameCharacters } from '@/utils/format-character';

import { motion } from 'framer-motion';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

interface ChatUser {
    id: number;
    name: string;
    imageSrc: string;
}

interface ChatUserSliderProps {
    users: ChatUser[];
    onAddUser?: () => void;
    onSelectUser?: (user: ChatUser) => void;
}

const ChatUserSlider: React.FC<ChatUserSliderProps> = ({ users, onAddUser, onSelectUser }) => {
    return (
        <div className="w-full overflow-hidden bg-transparent pt-2">
            <Swiper slidesPerView="auto" spaceBetween={30} pagination={false} className="!px-4  flex  items-center justify-center">
                {/* Add new user button */}
                <SwiperSlide style={{ width: '60px', marginTop: '2px' }}>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddUser}
                        className="flex h-[57px] w-[57px] cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-secondaryWhite"
                    >
                        <span className="text-2xl font-light text-gray-300">+</span>
                    </motion.div>
                </SwiperSlide>

                {/* User avatars */}
                {users.map((user) => (
                    <SwiperSlide key={user.id} style={{ width: '47px' }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelectUser?.(user)}
                            className="flex flex-col items-center justify-center text-center "
                        >
                            <div
                                style={{
                                    backgroundImage: `url(${user.imageSrc})`,
                                }}
                                className="h-[57px] w-[57px] rounded-full bg-cover bg-top bg-no-repeat transition-all duration-200"
                            ></div>
                            <p className="mt-2 w-[70px]  text-[10px] text-secondaryWhite whitespace-nowrap "> {formatNameCharacters(user.name, 8)}</p>
                        </motion.div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ChatUserSlider;
