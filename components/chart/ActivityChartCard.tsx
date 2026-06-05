// 'use client';

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import images from '@/constants/image';
// import { useState } from 'react';
// import { TiArrowSortedDown } from 'react-icons/ti';
// import ActivityBarChart from './ActivityBarChart';

// type RangeKey = '1_day' | '5_days' | '7_days';

// const DATA: Record<RangeKey, { day: string; value: number }[]> = {
//     '1_day': [{ day: 'Mon', value: 56 }],
//     '5_days': [
//         { day: 'Mon', value: 56 },
//         { day: 'Tue', value: 89 },
//         { day: 'Wed', value: 44 },
//         { day: 'Thu', value: 67 },
//         { day: 'Fri', value: 59 },
//     ],
//     '7_days': [
//         { day: 'Mon', value: 56 },
//         { day: 'Tue', value: 89 },
//         { day: 'Wed', value: 44 },
//         { day: 'Thu', value: 67 },
//         { day: 'Fri', value: 59 },
//         { day: 'Sat', value: 87 },
//         { day: 'Sun', value: 100 },
//     ],
// };

// const LABELS: Record<RangeKey, string> = {
//     '1_day': '1 day',
//     '5_days': '5 days',
//     '7_days': '7 days',
// };

// export default function ActivityChartCard() {
//     const [range, setRange] = useState<RangeKey>('7_days');

//     return (
//         <div className="relative overflow-hidden rounded-xl px-4 py-4">
//             <img src={images.mobileChartpattern} alt={`lead card bg`} className="absolute inset-0 top-0 z-0 h-auto w-full object-cover" />

//             {/* Top-left controls */}
//             <div className="absolute top-2 left-1 z-20 flex items-center gap-5">
//                 <Select value={range} onValueChange={(val) => setRange(val as RangeKey)}>
//                     <SelectTrigger className="relative h-5.5 w-fit rounded-full border-0 bg-[#C1B5FF] shadow-[1px_3px_6px_-1px_rgba(0,0,0,0.3),-2px_3px_6px_-1px_rgba(0,0,0,0.3)] px-3 py-1 pr-6 text-[9px] font-medium text-[#0B1727] [&>svg]:hidden">
//                         <SelectValue placeholder="Range" />

// <span className="ml-1">
//     <TiArrowSortedDown className="pointer-events-none absolute w-1  top-1/2 right-2 -translate-y-1/2  text-[#0B1727] transition-transform duration-200 data-[state=open]:rotate-180" />
// </span>
//                     </SelectTrigger>

//                     <SelectContent>
//                         <SelectItem value="1_day" className="text-[10px]">
//                             1 Day
//                         </SelectItem>
//                         <SelectItem value="5_days" className="text-[10px]">
//                             5 Days
//                         </SelectItem>
//                         <SelectItem value="7_days" className="text-[10px]">
//                             7 Days
//                         </SelectItem>
//                     </SelectContent>
//                 </Select>

//                 {/* Active range label */}
//                 <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#0B1727] shadow-sm">{LABELS[range]}</div>
//             </div>

//             {/* Chart */}
//             <div className="relative z-10 mt-10">
//                 <ActivityBarChart data={DATA[range]} />
//             </div>
//         </div>
//     );
// }

'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import images from '@/constants/image';
import { useState } from 'react';
import { TiArrowSortedDown } from 'react-icons/ti';
import ActivityBarChart from './ActivityBarChart';

type RangeKey = '5_days' | '7_days' | '14_days';

/* ------------------------------------------------------------------
   SAMPLE DATA
   👉 Replace values later with real API data
------------------------------------------------------------------- */
const DATA: Record<RangeKey, { day: string; value: number }[]> = {
    '5_days': [
        { day: 'Mon', value: 56 },
        { day: 'Tue', value: 89 },
        { day: 'Wed', value: 44 },
        { day: 'Thu', value: 67 },
        { day: 'Fri', value: 59 },
    ],
    '7_days': [
        { day: 'Mon', value: 56 },
        { day: 'Tue', value: 89 },
        { day: 'Wed', value: 44 },
        { day: 'Thu', value: 67 },
        { day: 'Fri', value: 59 },
        { day: 'Sat', value: 87 },
        { day: 'Sun', value: 100 },
    ],
    '14_days': Array.from({ length: 14 }, (_, i) => ({
        day: `D${i + 1}`,
        value: Math.floor(40 + Math.random() * 60),
    })),
};

/* ------------------------------------------------------------------
   LABELS
------------------------------------------------------------------- */
const LABELS: Record<RangeKey, string> = {
    '5_days': '5 days',
    '7_days': '7 days',
    '14_days': '14 days',
};

export default function ActivityChartCard() {
    // 👉 Chart defaults to 7 days
    const [range, setRange] = useState<RangeKey>('7_days');

    return (
        <div className="relative overflow-hidden rounded-xl px-4 p-0">
            <img src={images.mobileChartpattern} alt="chart background" className="absolute inset-0 top-0 z-0 h-auto w-full object-cover" />

           
            <div className="absolute top-3  left-2.5 z-20 flex items-center gap-5 tag-label-mobile-chart-control">
                <Select onValueChange={(val) => setRange(val as RangeKey)}>
                    <SelectTrigger className="relative h-5.5 w-fit rounded-full border-0 bg-[#C1B5FF] shadow-[1px_3px_6px_-1px_rgba(0,0,0,0.1),-2px_3px_6px_-1px_rgba(0,0,0,0.1)] px-2 py-1 pr-6 text-[9px] font-medium text-[#0B1727]! [&>svg]:hidden">
                        {/* DEFAULT PLACEHOLDER */}
                        <SelectValue className='text-[9px] font-medium   data-[data=slot]:text-[#0B1727]' placeholder="More" />

                        <span className="ml-1">
                            <TiArrowSortedDown className="pointer-events-none absolute top-1/2 right-2 w-1 -translate-y-1/2 text-[#0B1727] transition-transform duration-200 data-[state=open]:rotate-180" />
                        </span>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="5_days" className="text-[10px]">
                            5 Days
                        </SelectItem>
                        <SelectItem value="7_days" className="text-[10px]">
                            7 Days
                        </SelectItem>
                        <SelectItem value="14_days" className="text-[10px]">
                            14 Days
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* ACTIVE RANGE LABEL */}
                <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#0B1727] shadow-sm">{LABELS[range]}</div>
            </div>

            {/* ------------------------------------------------------------------
         CHART WRAPPER
         👉 Adjust `mt-12` to move chart DOWN for better balance
      ------------------------------------------------------------------- */}
            <div className="relative z-10 mt-12">
                <ActivityBarChart data={DATA[range]} />
            </div>
        </div>
    );
}
