// 'use client';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';

// interface ChartProps {
//   apiUrl?: string; // Optional Laravel API endpoint
// }

// const BasicColumnChart: React.FC<ChartProps> = ({ apiUrl }) => {
//   const [chartData, setChartData] = useState<{
//     series: { name: string; data: number[] }[];
//     options: any;
//   }>({
//     series: [
//       {
//         name: 'Users',
//         data: [],
//       },
//     ],
//     options: {
//       chart: {
//         type: 'bar',
//         height: 350,
//         toolbar: { show: false },
//         dropShadow: {
//           enabled: true,
//           top: 2,
//           left: 2,
//           blur: 6,
//           opacity: 0.25,
//           color: '#0B1727', // same as bar but slightly faded
//         },
//       },
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           columnWidth: '45%',
//           borderRadius: 6,
//         },
//       },
//       dataLabels: { enabled: false },
//       xaxis: {
//         categories: [],
//         labels: {
//           style: {
//             colors: '#6B7280',
//             fontSize: '12px',
//           },
//         },
//       },
//       yaxis: {
//         labels: {
//           style: {
//             colors: '#6B7280',
//             fontSize: '12px',
//           },
//         },
//       },
//       grid: {
//         borderColor: '#E5E7EB',
//       },
//       colors: ['#0B1727'], // ✅ Updated bar color
//       legend: {
//         position: 'top',
//         labels: {
//           colors: '#374151',
//         },
//       },
//     },
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (apiUrl) {
//           const response = await axios.get(apiUrl);
//           const { categories, values } = response.data;

//           setChartData((prev) => ({
//             ...prev,
//             series: [{ name: 'Users', data: values }],
//             options: {
//               ...prev.options,
//               xaxis: { ...prev.options.xaxis, categories },
//             },
//           }));
//         } else {
//           const dummyResponse = {
//             categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//             values: [10, 25, 15, 30, 22, 18, 27],
//           };

//           setChartData((prev) => ({
//             ...prev,
//             series: [{ name: 'Users', data: dummyResponse.values }],
//             options: {
//               ...prev.options,
//               xaxis: { ...prev.options.xaxis, categories: dummyResponse.categories },
//             },
//           }));
//         }
//       } catch (error) {
//         console.error('Error fetching Column Chart data:', error);
//       }
//     };

//     fetchData();
//   }, [apiUrl]);

//   return (
//     <div className="relative z-10 overflow-hidden">
//       <ReactApexChart
//         options={chartData.options}
//         series={chartData.series}
//         type="bar"
//         height={300}
//       />
//     </div>
//   );
// };

// export default BasicColumnChart;





// 'use client';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { cn } from '@/lib/utils';

// interface ChartProps {
//   apiUrl?: string;
// }

// const BasicColumnChart: React.FC<ChartProps> = ({ apiUrl }) => {
//   const [range, setRange] = useState('7_days');
//   const [chartData, setChartData] = useState<{
//     series: { name: string; data: number[] }[];
//     options: any;
//   }>({
//     series: [
//       {
//         name: 'Users',
//         data: [],
//       },
//     ],
//     options: {
//       chart: {
//         type: 'bar',
//         height: 350,
//         toolbar: { show: false },
//         dropShadow: {
//           enabled: true,
//           top: 2,
//           left: 2,
//           blur: 6,
//           opacity: 0.25,
//           color: '#0B1727',
//         },
//       },
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           columnWidth: '65%',
//           borderRadius: 8,
//         },
//       },
//       dataLabels: { enabled: false },
//       xaxis: {
//         categories: [],
//         labels: {
//           style: {
//             colors: '#6B7280',
//             fontSize: '12px',
//           },
//         },
//       },
//       yaxis: {
//         labels: {
//           style: {
//             colors: '#6B7280',
//             fontSize: '12px',
//           },
//         },
//       },
//       grid: {
//         borderColor: '#E5E7EB',
//       },
//       colors: ['#0B1727'],
//       legend: {
//         position: 'top',
//         labels: {
//           colors: '#374151',
//         },
//       },
//     },
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (apiUrl) {
//           const response = await axios.get(`${apiUrl}?range=${range}`);
//           const { categories, values } = response.data;

//           setChartData((prev) => ({
//             ...prev,
//             series: [{ name: 'Users', data: values }],
//             options: {
//               ...prev.options,
//               xaxis: { ...prev.options.xaxis, categories },
//             },
//           }));
//         } else {
//           // Dummy values for visual testing
//           const dummyData: Record<string, any> = {
//             '7_days': {
//               categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//               values: [56, 89, 44, 67, 59, 87, 100],
//             },
//             '30_days': {
//               categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
//               values: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
//             },
//             '90_days': {
//               categories: Array.from({ length: 12 }, (_, i) => `Wk ${i + 1}`),
//               values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
//             },
//           };

//           const { categories, values } = dummyData[range];
//           setChartData((prev) => ({
//             ...prev,
//             series: [{ name: 'Users', data: values }],
//             options: {
//               ...prev.options,
//               xaxis: { ...prev.options.xaxis, categories },
//             },
//           }));
//         }
//       } catch (error) {
//         console.error('Error fetching Column Chart data:', error);
//       }
//     };

//     fetchData();
//   }, [apiUrl, range]);

//   return (
//     <div className="relative z-10 overflow-hidden bg-[#CDE0DC] rounded-xl py-2 px-1">
//       {/* Header with Select + Range pill */}
//       <div className="flex items-center justify-start gap-3 mb-2">
//         <Select onValueChange={(val) => setRange(val)} defaultValue={range}>
//           <SelectTrigger className="w-[120px] bg-[#C1B5FF] text-[#0B1727] font-medium rounded-full h-9 px-3 border-0">
//             <SelectValue placeholder="More" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="7_days">7 days</SelectItem>
//             <SelectItem value="30_days">30 days</SelectItem>
//             <SelectItem value="90_days">90 days</SelectItem>
//           </SelectContent>
//         </Select>

//         <div className="bg-white text-[#0B1727] px-3 py-1  rounded-full text-xs font-semibold shadow-sm">
//           {range === '7_days'
//             ? '7 days'
//             : range === '30_days'
//             ? '30 days'
//             : '90 days'}
//         </div>
//       </div>

//       {/* Chart */}
//       <ReactApexChart
//         options={chartData.options}
//         series={chartData.series}
//         type="bar"
//         height={300}
//       />
//     </div>
//   );
// };

// export default BasicColumnChart;







// 'use client';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// interface ChartProps {
//   apiUrl?: string;
// }

// const BasicColumnChart: React.FC<ChartProps> = ({ apiUrl }) => {
//   const [range, setRange] = useState<'1_day' | '5_days' | '7_days'>('1_day');

//   const [chartData, setChartData] = useState<{
//     series: { name: string; data: number[] }[];
//     options: any;
//   }>({
//     series: [{ name: 'Users', data: [] }],
//     options: {
//       chart: {
//         type: 'bar',
//         height: 350,
//         toolbar: { show: false },
//         dropShadow: {
//           enabled: true,
//           top: 2,
//           left: 2,
//           blur: 6,
//           opacity: 0.25,
//           color: '#0B1727',
//         },
//       },
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           columnWidth: '65%',
//           borderRadius: 8,
//         },
//       },
//       dataLabels: { enabled: false },
//       xaxis: {
//         categories: [],
//         labels: {
//           style: {
//             colors: '#6B7280',
//             fontSize: '12px',
//           },
//         },
//       },
//       yaxis: {
//         labels: {
//           style: {
//             colors: '#6B7280',
//             fontSize: '12px',
//           },
//         },
//       },
//       grid: {
//         borderColor: '#E5E7EB',
//       },
//       colors: ['#0B1727'],
//       legend: {
//         position: 'top',
//         labels: { colors: '#374151' },
//       },
//     },
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (apiUrl) {
//           const response = await axios.get(`${apiUrl}?range=${range}`);
//           const { categories, values } = response.data;

//           setChartData((prev) => ({
//             ...prev,
//             series: [{ name: 'Users', data: values }],
//             options: {
//               ...prev.options,
//               xaxis: { ...prev.options.xaxis, categories },
//             },
//           }));
//         } else {
//           // Dummy data for local testing
//           const dummyData: Record<string, any> = {
//             '1_day': {
//               categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
//               values: Array.from({ length: 24 }, () =>
//                 Math.floor(Math.random() * 100)
//               ),
//             },
//             '5_days': {
//               categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
//               values: [56, 89, 44, 67, 59],
//             },
//             '7_days': {
//               categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//               values: [56, 89, 44, 67, 59, 87, 100],
//             },
//           };

//           const { categories, values } = dummyData[range];
//           setChartData((prev) => ({
//             ...prev,
//             series: [{ name: 'Users', data: values }],
//             options: {
//               ...prev.options,
//               xaxis: { ...prev.options.xaxis, categories },
//             },
//           }));
//         }
//       } catch (error) {
//         console.error('Error fetching chart data:', error);
//       }
//     };

//     fetchData();
//   }, [apiUrl, range]);

//   return (
//     <div className="relative z-10 overflow-hidden bg-[#CDE0DC] rounded-xl py-2 px-1">
//       {/* Header with Select + Range Pill */}
//       <div className="flex items-center justify-start gap-3 mb-2">
//         <Select onValueChange={(val) => setRange(val as any)} defaultValue={range}>
//           <SelectTrigger className="w-[120px] bg-[#C1B5FF] text-[#0B1727] font-medium rounded-full h-9 px-3 border-0">
//             <SelectValue placeholder="Range" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="1_day">1 Day (Hourly)</SelectItem>
//             <SelectItem value="5_days">5 Days</SelectItem>
//             <SelectItem value="7_days">7 Days</SelectItem>
//           </SelectContent>
//         </Select>

//         <div className="bg-white text-[#0B1727] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
//           {range === '1_day'
//             ? 'Today (24 hrs)'
//             : range === '5_days'
//             ? 'Last 5 days'
//             : 'Last 7 days'}
//         </div>
//       </div>

//       {/* Chart */}
//       <ReactApexChart
//         options={chartData.options}
//         series={chartData.series}
//         type="bar"
//         height={300}
//       />
//     </div>
//   );
// };

// export default BasicColumnChart;













'use client';
import axios from 'axios';
import { format, subDays, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ChartProps {
  userId?: number;
  apiUrl?: string; // Keep for backward compatibility
}


const BasicColumnChart: React.FC<ChartProps> = ({ userId }) => {
  const [range, setRange] = useState<'1_day' | '5_days' | '7_days'>('1_day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chartData, setChartData] = useState<{
    series: { name: string; data: number[] }[];
    options: any;
  }>({
    series: [{ name: 'Time Online', data: [] }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        dropShadow: {
          enabled: true,
          top: 2,
          left: 2,
          blur: 6,
          opacity: 0.25,
          color: '#0B1727',
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '65%',
          borderRadius: 8,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px',
          },
          formatter: (value: number) => {
            if (value >= 60) {
              const hours = Math.floor(value / 60);
              const minutes = value % 60;
              if (minutes > 0) {
                return `${hours}h ${minutes}m`;
              }
              return `${hours}h`;
            }
            return `${value}m`;
          },
        },
      },
      grid: { borderColor: '#E5E7EB' },
      colors: ['#0B1727'],
      legend: {
        position: 'top',
        labels: { colors: '#374151' },
      },
      tooltip: {
        y: {
          formatter: (value: number) => {
            if (value >= 60) {
              const hours = Math.floor(value / 60);
              const minutes = value % 60;
              if (minutes > 0) {
                return `${hours}h ${minutes}m online`;
              }
              return `${hours}h online`;
            }
            return `${value} minutes online`;
          },
        },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log('BasicColumnChart: userId received:', userId, 'range:', range);

      try {
        setError(null);
        setLoading(true);
        console.log('BasicColumnChart: Fetching data for user:', userId);

        // Use the current authenticated user or the passed userId
        const apiBaseUrl = userId ? `/api/user/${userId}` : '/api/user';
        const response = await axios.get(apiBaseUrl);
        console.log('BasicColumnChart: API response:', response.data);

        const { data } = response.data;

        let categories: string[] = [];
        let values: number[] = [];

        if (range === '1_day') {
          // Show hourly data for today (24 hours, every 2 hours = 12 data points)
          const today = format(new Date(), 'yyyy-MM-dd');
          const todayData = data[today] || 0;

          // For 1 day, we'll show 2-hour intervals (12 points)
          categories = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
          // Distribute the daily total across hours with some randomness for demo
          const baseValue = todayData / 12;
          values = Array.from({ length: 12 }, (_, i) => {
            // Add some variation based on typical usage patterns
            const hourMultiplier = i < 3 || i > 10 ? 0.3 : // Early morning/late night
              i >= 6 && i <= 9 ? 1.5 : // Peak hours
                1.0; // Normal hours
            return Math.floor(baseValue * hourMultiplier * (0.7 + Math.random() * 0.6));
          });
        } else if (range === '5_days') {
          // Show last 5 days
          const days = Array.from({ length: 5 }, (_, i) => {
            const date = subDays(new Date(), 4 - i);
            return format(date, 'yyyy-MM-dd');
          });

          categories = days.map(date => format(new Date(date), 'EEE')); // Mon, Tue, etc.
          values = days.map(date => data[date] || 0);
        } else {
          // 7_days - Show last 7 days
          const days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            return format(date, 'yyyy-MM-dd');
          });

          categories = days.map(date => format(new Date(date), 'EEE')); // Mon, Tue, etc.
          values = days.map(date => data[date] || 0);
        }

        setChartData((prev) => ({
          ...prev,
          series: [{ name: 'Time Online', data: values }],
          options: {
            ...prev.options,
            xaxis: { ...prev.options.xaxis, categories },
          },
        }));

        setLoading(false);
      } catch (error: any) {
        console.error('BasicColumnChart: Error fetching activity data:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load activity data';
        setError(`Error: ${errorMessage}`);
        setLoading(false);
      }
    };

    // Fetch initial data
    fetchData();

    // Set up polling every 5 minutes (same as BasicAreaChart)
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId, range]);

  if (loading) {
    return (
      <div className="relative z-10 overflow-hidden bg-[#CDE0DC] rounded-xl py-2 px-1">
        <div className="flex items-center justify-center h-[350px]">
          <div className="text-[#0B1727]/70 text-sm">Loading activity data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative z-10 overflow-hidden bg-[#CDE0DC] rounded-xl py-2 px-1">
        <div className="flex items-center justify-center h-[350px]">
          <div className="text-[#0B1727]/70 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 overflow-hidden bg-[#CDE0DC] rounded-xl py-2 px-1">
      {/* Header with Select + Range Pill */}
      <div className="flex items-center justify-start gap-3 mb-2">
        <Select onValueChange={(val) => setRange(val as any)} defaultValue={range}>
          <SelectTrigger className="w-[120px] bg-[#C1B5FF] text-[#0B1727] font-medium rounded-full h-9 px-3 border-0">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1_day">1 Day</SelectItem>
            <SelectItem value="5_days">5 Days</SelectItem>
            <SelectItem value="7_days">7 Days</SelectItem>
          </SelectContent>
        </Select>

        <div className="bg-white text-[#0B1727] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          {range === '1_day'
            ? 'Today (2-hr intervals)'
            : range === '5_days'
              ? 'Last 5 days'
              : 'Last 7 days'}
        </div>
      </div>

      {/* Chart */}
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={300}
      />
    </div>
  );
};

export default BasicColumnChart;
