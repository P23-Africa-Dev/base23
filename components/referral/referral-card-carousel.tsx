// // src/components/CardCarousel.tsx
// import React, { useState } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import SwiperCore from 'swiper';
// import 'swiper/css';
// import 'swiper/css/effect-coverflow';

// // Import Swiper modules
// import { EffectCoverflow, Pagination } from 'swiper/modules';
// import TeamCard, { CardData } from './referral-card';

// // import { CardData } from '../types/CardData'; \

// // Register Swiper modules
// SwiperCore.use([EffectCoverflow, Pagination]);

// interface ReferralCardCarouselProps {
//   cards: CardData[];
// }

// const ReferralCardCarousel: React.FC<ReferralCardCarouselProps> = ({ cards }) => {
//   const [activeIndex, setActiveIndex] = useState(0); // State to track the index of the active slide

//   return (
//     <div className="w-full py-16  to-transparent"> {/* Added gradient background for design matching */}
//       <Swiper
//         effect={'coverflow'}
//         grabCursor={true}
//         centeredSlides={true}
//         loop={true} // Enable looping to match the infinite look of the design
//         slidesPerView={'auto'} // Allows the cards to size based on their content/container
//         coverflowEffect={{
//           rotate: 0,
//           stretch: 0,
//           depth: 100,
//           modifier: 2.5,
//           slideShadows: false,
//         }}
//         // Swiper breakpoints for responsiveness
//         breakpoints={{
//             640: {
//                 slidesPerView: 3.5, // 3.5 slides visible on small screens
//             },
//             768: {
//                 slidesPerView: 4.5, // 4.5 slides visible on medium screens
//             },
//             1024: {
//                 slidesPerView: 5, // 5 slides visible on large screens (as per design)
//             },
//         }}
//         // Event listener to update the active index
//         onSlideChange={(swiper) => {
//           // Swiper's realIndex is the index of the active slide, ignoring loop duplicates
//           setActiveIndex(swiper.realIndex); 
//         }}
//         initialSlide={Math.floor(cards.length / 2)} // Start at the center if possible
//         className="mySwiper w-full h-[500px] sm:h-[550px]" // Set max height for the carousel container
//       >
//         {cards.map((card, index) => (
//           <SwiperSlide key={card.id} className="!w-[220px] sm:!w-[250px] flex justify-center items-center">
//             <TeamCard card={card} isActive={index === activeIndex} />
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// };

// export default ReferralCardCarousel;










// import React, { useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectCoverflow } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import Card from "./referral-card";

// interface CardItem {
//   id: number;
//   image: string;
//   name: string;
//   title: string;
// }

// interface CardCarouselProps {
//   cards: CardItem[];
// }

// const CardCarousel: React.FC<CardCarouselProps> = ({ cards }) => {
//   const [activeIndex, setActiveIndex] = useState(0);

//   return (
//     <div className="w-full flex justify-center py-10 bg-[#0d2438]">
//       <div className="w-full md:w-4/5">
//         <Swiper
//           modules={[EffectCoverflow]}
//           effect="coverflow"
//           centeredSlides
//           slidesPerView="auto"
//           loop
//           grabCursor
//           coverflowEffect={{
//             rotate: 0,
//             stretch: 0,
//             depth: 100,
//             modifier: 2.5,
//             slideShadows: false,
//           }}
//           onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
//           className="pb-10"
//         >
//           {cards.map((card, index) => (
//             <SwiperSlide
//               key={card.id}
//               className="w-60 md:w-72 lg:w-80 transition-all duration-300"
//             >
//               <Card
//                 image={card.image}
//                 name={card.name}
//                 title={card.title}
//                 isActive={index === activeIndex}
//               />
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </div>
//   );
// };

// export default CardCarousel;





import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import Card from "./referral-card";

interface CardItem {
  id: number;
  name: string;
  location: string;
  title: string;
  industry: string;
  imageSrc: string;
}

interface CardCarouselProps {
  cards: CardItem[];
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full flex justify-center  ">
      <div className="w-full">
        <Swiper
          modules={[EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          slidesPerView="auto"
          spaceBetween={30}
          loop
          grabCursor
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                  breakpoints={{
            640: {
                slidesPerView: 3.5, // 3.5 slides visible on small screens
            },
            768: {
                slidesPerView: 4.5, // 4.5 slides visible on medium screens
            },
            1024: {
                slidesPerView: 5, // 5 slides visible on large screens (as per design)
            },
        }}
          className="pb-10 flex gap-10"
        >
          {cards.map((card, index) => (
            <SwiperSlide
              key={card.id}
              className=" transition-all duration-300"
            >
              <Card
                imageSrc={card.imageSrc}
                name={card.name}
                title={card.title}
                location={card.location}
                industry={card.industry}
                isActive={index === activeIndex}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CardCarousel;
