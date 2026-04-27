// 'use client';

// import images from '@/constants/image';
// import { motion, useAnimationControls } from 'framer-motion';
// import { useEffect } from 'react';

// export default function DashboardLoader() {
//     const controls = useAnimationControls();

//     useEffect(() => {
//         const runAnimation = async () => {
//             // Step 1: Fill from 0% to 70%
//             await controls.start({
//                 width: '10%',
//                 transition: { duration: 1.2, ease: 'easeInOut' },
//             });

//             // Step 1: Pause briefly at 10%
//             await new Promise((resolve) => setTimeout(resolve, 400));

//             // Step 2: Fill from 10% to 80%
//             await controls.start({
//                 width: '80%',
//                 transition: { duration: 1.9, ease: 'easeInOut' },
//             });

//             // Step 2: Pause briefly at 80%
//             await new Promise((resolve) => setTimeout(resolve, 300));

//             // Step 3: Continue to 100%
//             await controls.start({
//                 width: '100%',
//                 transition: { duration: 1.7, ease: 'easeInOut' },
//             });

//             // Step 4: Optional — small delay before finishing
//             await new Promise((resolve) => setTimeout(resolve, 300));
//         };

//         runAnimation();
//     }, [controls]);

//     return (
//         <div className="flex h-screen flex-col items-center justify-center bg-white">
//             {/* Logo */}
//             <div className="mb-6">
//                 <img src={images.logo} alt="NOEL Logo" width={260} height={80} className="select-none" />
//             </div>

//             {/* Loader Bar */}
//             <div className="relative h-3 w-72 overflow-hidden rounded-full bg-gray-100">
//                 <motion.div
//                     animate={controls}
//                     initial={{ width: '0%' }}
//                     className="h-full rounded-full  bg-[linear-gradient(90deg, #A47AF0_0%, /* violet start */ #7F9BE8_20%, /* softened violet-blue mix */ #0000004D_30%, /* translucent black for depth */ #4FD3B9_60%, /* aqua tint blend */ #27E6A7_100% /* bright green end */ )] h-full rounded-full shadow-[0_0_12px_rgba(164,122,240,0.25)]"
//                 />
//             </div>
//         </div>
//     );
// }



// "use client";

// import images from "@/constants/image";
// import { motion, useAnimationControls } from "framer-motion";
// import { useEffect, useState } from "react";

// export default function DashboardLoader() {
//   const controls = useAnimationControls();
//   const [done, setDone] = useState(false);

//   useEffect(() => {
//     const runAnimation = async () => {
//       // Simulate progressive load stages with realistic timing
//       await controls.start({
//         width: "20%",
//         transition: { duration: 1.2, ease: "easeInOut" },
//       });

//       await new Promise((r) => setTimeout(r, 600));

//       await controls.start({
//         width: "60%",
//         transition: { duration: 2.4, ease: "easeInOut" },
//       });

//       await new Promise((r) => setTimeout(r, 800));

//       await controls.start({
//         width: "100%",
//         transition: { duration: 3.2, ease: "easeInOut" },
//       });

//       // Simulated “1000% load” = full completion delay before hide
//       await new Promise((r) => setTimeout(r, 3000));

//     };

//     runAnimation();
//   }, [controls]);


//   return (
//     <div className="flex h-screen flex-col items-center justify-center bg-white">
//       {/* Logo */}
//       <div className="mb-6">
//         <img
//           src={images.logo}
//           alt="NOEL Logo"
//           width={260}
//           height={80}
//           className="select-none"
//         />
//       </div>

//       {/* Loader Bar */}
//       <div className="relative h-3 w-72 overflow-hidden rounded-full bg-gray-200">
//         <motion.div
//           animate={controls}
//           initial={{ width: "0%" }}
//           className="
//             h-full rounded-full 
//             bg-[linear-gradient(90deg,#A47AF0_0%,#0000004D_30%,#27E6A7_100%)]
//             shadow-[0_0_14px_rgba(164,122,240,0.3)]
//           "
//         />
//       </div>
//     </div>
//   );
// }











"use client";

import images from "@/constants/image";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

export default function DashboardLoader({ onComplete }: { onComplete: () => void }) {
  const controls = useAnimationControls();

  useEffect(() => {
    const runAnimation = async () => {
      // Step 1: 0 → 20%
      await controls.start({
        width: "20%",
        transition: { duration: 1.2, ease: "easeInOut" },
      });

      await new Promise((r) => setTimeout(r, 600));

      // Step 2: 20 → 60%
      await controls.start({
        width: "60%",
        transition: { duration: 2.4, ease: "easeInOut" },
      });

      await new Promise((r) => setTimeout(r, 800));

      // Step 3: 60 → 100%
      await controls.start({
        width: "100%",
        transition: { duration: 3.2, ease: "easeInOut" },
      });

      // Step 4: Small delay to simulate finishing load
      await new Promise((r) => setTimeout(r, 500));

      // Notify layout loader has finished
      onComplete();
    };

    runAnimation();
  }, [controls, onComplete]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="mb-6">
        <img
          src={images.logo}
          alt="NOEL Logo"
          width={260}
          height={80}
          className="select-none"
        />
      </div>

      {/* Loader Bar */}
      <div className="relative h-3 w-72 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          animate={controls}
          initial={{ width: "0%" }}
          className="
            h-full rounded-full
            bg-[linear-gradient(90deg,#A47AF0_0%,#0000004D_30%,#27E6A7_100%)]
            shadow-[0_0_14px_rgba(164,122,240,0.3)]
          "
        />
      </div>
    </div>
  );
}
