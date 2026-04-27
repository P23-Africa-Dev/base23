// // src/components/TeamCard.tsx
// import React from 'react';
// // Assuming CardData is imported from its file path

// // CardData Interface (Included here for context, but should remain in src/types/CardData.ts)
// export interface CardData {
//   id: number;
//   name: string;
//   title: string;
//   imageSrc: string;
//   location?: string;
//   industry?: string;
//   rating?: number;
//   experience?: string;
//   interest?: string;
//   reviews?: string;
//   leads?: string;
//   baseLocation?: string;
//   operatesIn?: string;
//   bio?: string;
//   companyStage?: string;
//   keyStrength?: string;
//   topGoal?: string;
//   brnMemberSince?: string;
//   responseRate?: string;
//   successfulDealsRate?: string;
// }

// interface TeamCardProps {
//   card: CardData;
//   isActive: boolean; // Prop to determine if this is the active (center) card
// }

// const TeamCard: React.FC<TeamCardProps> = ({ card, isActive }) => {
//   // FIX 1: Destructure 'imageSrc' instead of 'imageUrl'
//   const { name, title, imageSrc } = card;

//   // Conditional styles for the rounded-green circle and the overlay
//   const indicatorClasses = isActive
//     ? 'w-4 h-4 rounded-full bg-purple-500 absolute bottom-3 left-1/2 transform -translate-x-1/2 border-2 border-white'
//     : 'w-3 h-3 rounded-full bg-purple-500 absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-70'; // Slightly smaller and dimmer for inactive

//   return (
//     <div
//       className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out ${
//         isActive ? 'h-full scale-100' : 'h-[90%] scale-[0.9] opacity-70' // Active card is full height and scale 100, others are slightly smaller and transparent
//       }`}
//     >
//       {/* Card Image */}
//       <img
//         // FIX 2: Use the correct variable name 'imageSrc'
//         src={imageSrc}
//         alt={name}
//         className="w-full object-cover rounded-xl"
//         // Adjust the height to match your desired aspect ratio
//         style={{ height: isActive ? '450px' : '400px' }} // Example height adjustment
//       />

//       {/* Overlay for Active Card */}
//       {isActive && (
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-16">
//           <div className="text-center text-white">
//             <h3 className="text-xl font-bold">{name}</h3>
//             <p className="text-sm font-light text-gray-200">{title}</p>
//           </div>
//         </div>
//       )}

//       {/* Placeholder (e.g., Folder/Document Icon) */}
//       <div
//         className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 p-2 rounded-lg ${
//           isActive ? 'bg-white' : 'bg-white/80' // Brighter background for active card
//         }`}
//       >
//         <span className="text-gray-700 text-lg">📁</span> {/* Replace with actual icon */}
//       </div>

//       {/* Rounded Indicator Circle (Purple as per image) */}
//       <div className={indicatorClasses}></div>

//     </div>
//   );
// };

// export default TeamCard;

// import React from "react";

// interface CardProps {
//   image: string;
//   name: string;
//   title: string;
//   isActive?: boolean;
// }

// const Card: React.FC<CardProps> = ({ image, name, title, isActive }) => {
//   return (
//     <div
//       className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out ${
//         isActive ? "scale-105" : "scale-90 opacity-80"
//       }`}
//     >
//       <img
//         src={image}
//         alt={name}
//         className="w-full h-80 object-cover rounded-2xl"
//       />

//       {/* Overlay (only visible when active) */}
//       {isActive && (
//         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
//           <h3 className="text-lg font-semibold">{name}</h3>
//           <p className="text-sm">{title}</p>

//           {/* Green Circle */}
//           <div className="absolute bottom-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
//         </div>
//       )}

//       {/* Bottom pink bar (for all) */}
//       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 w-1/4 h-1 bg-pink-400 rounded-full"></div>
//     </div>
//   );
// };

// export default Card;

import images from '@/constants/image';
import { formatNameCharacters } from '@/utils/format-character';
import React from 'react';

interface CardProps {
    imageSrc: string;
    name: string;
    title: string;
    location: string;
    industry: string;
    isActive?: boolean;
}

const Card: React.FC<CardProps> = ({ imageSrc, name, title, isActive }) => {
    return (
        <div className="flex flex-col items-center justify-center rounded-4xl bg-white">
            <div className="flex flex-col gap-3 py-4">
                <div
                    style={{
                        backgroundImage: `url(${imageSrc})`,
                    }}
                    className="h-[300px] w-[250px] overflow-hidden rounded-3xl bg-cover bg-top bg-no-repeat shadow-[1px_3px_10px_-1px_rgba(0,0,0,0.4),-2px_3px_10px_-1px_rgba(0,0,0,0.4)]"
                ></div>

                {/* Overlay for the active card */}
                {isActive && (
                    <div
                        style={{
                            backgroundImage: ` url(${images.blurProfilename})`,
                        }}
                        className="absolute bottom-15 rounded-xl bg-cover bg-center bg-no-repeat px-3  text-right"
                    >
                        <div className="py-4 pr-3 text-white">
                            <h1 className="text-2xl leading-5 font-bold"> {formatNameCharacters(`${name}`, 12)}</h1>
                            <p className="mt-1 text-sm font-medium">{title}</p>
                        </div>
                    </div>
                )}

                <div>
                    <div className="h-[40px] w-[40px] self-start rounded-full bg-[#9669CE]"></div>

                    <div></div>
                </div>
            </div>
        </div>
    );
};

export default Card;
