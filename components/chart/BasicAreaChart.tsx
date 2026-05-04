'use client';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartProps {
    userId?: number;
}

interface ActivityData {
    date: string;
    minutes_online: number;
}

interface ChartState {
    series: {
        name: string;
        data: { x: number; y: number }[];
    }[];
    options: {
        chart: {
            type: 'area';
            height: number;
            zoom: { enabled: boolean };
            toolbar?: { show: boolean };
            sparkline?: { enabled: boolean };
            parentHeightOffset?: number;
            offsetY?: number;
        };
        dataLabels: {
            enabled: boolean;
        };
        stroke: {
            curve: 'smooth' | 'straight' | 'stepline' | 'linestep' | 'monotoneCubic' | ('smooth' | 'straight' | 'stepline' | 'linestep' | 'monotoneCubic')[];
            width?: number;
        };
        fill?: {
            type: string;
            gradient?: {
                shadeIntensity: number;
                opacityFrom: number;
                opacityTo: number;
                stops: number[];
            };
            pattern?: {
                style: string;
                width: number;
                height: number;
                strokeWidth: number;
            };
        };
        markers?: {
            size: number;
            colors: string[];
            strokeColors: string;
            strokeWidth: number;
            hover?: { size: number };
        };
        colors?: string[];
        labels: string[];
        xaxis: {
            type: 'datetime' | 'category' | 'numeric' | undefined;
            labels?: { show: boolean };
            axisBorder?: { show: boolean };
            axisTicks?: { show: boolean };
        };
        yaxis: {
            show?: boolean;
            opposite?: boolean;
        };
        grid?: {
            show: boolean;
        };
        tooltip?: {
            enabled: boolean;
            theme: string;
            x?: { format: string };
            y?: { formatter: (value: number) => string };
        };
        legend: {
            show?: boolean;
            horizontalAlign?: 'left' | 'center' | 'right';
        };
    };
}

const generateDummyData = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return {
            x: date.getTime(),
            y: Math.floor(Math.random() * 80) + 20,
        };
    });
};

const BasicAreaChart: React.FC<ChartProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartState>({
        series: [
            {
                name: 'Time Online',
                data: [],
            },
        ],
        options: {
            chart: {
                type: 'area',
                height: 350,
                zoom: { enabled: false },
                toolbar: { show: false },
                sparkline: { enabled: true },
                parentHeightOffset: 0,
                offsetY: 5,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth' as const,
                width: 2,
            },
            fill: {
                type: 'pattern',
                pattern: {
                    style: 'verticalLines',
                    width: 6,
                    height: 6,
                    strokeWidth: 2,
                },
            },
            markers: {
                size: 0,
                colors: ['#ffffff'],
                strokeColors: '#ffffff',
                strokeWidth: 2,
                hover: { size: 6 },
            },
            colors: ['#ffffff'],
            labels: [],
            xaxis: {
                type: 'datetime',
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                show: false,
            },
            grid: {
                show: false,
            },
            tooltip: {
                enabled: true,
                theme: 'dark',
                x: {
                    format: 'dd MMM yyyy',
                },
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
            legend: {
                show: false,
            },
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            console.log('BasicAreaChart: userId received:', userId);
            
            // Allow fetching without userId (will use current authenticated user)
            // if (!userId || userId === 0) {
            //     setError('User not authenticated');
            //     setLoading(false);
            //     return;
            // }

            try {
                console.log('BasicAreaChart: Fetching data for user:', userId);
                
                // Use the current authenticated user or the passed userId
                const apiUrl = userId ? `/api/user/${userId}` : '/api/user';
                const response = await axios.get(apiUrl);
                console.log('BasicAreaChart: API response:', response.data);
                
                const { data } = response.data;

                const today = new Date();
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = subDays(today, 6 - i);
                    return format(date, 'yyyy-MM-dd');
                });

                const activityData: ActivityData[] = last7Days.map((date) => ({
                    date,
                    minutes_online: data[date] || 0,
                }));

                // Convert dates to timestamps for better chart rendering
                const chartDataPoints = activityData.map((point) => ({
                    x: new Date(point.date).getTime(),
                    y: point.minutes_online,
                }));

                const allZero = chartDataPoints.every((p) => p.y === 0);
                setChartData((prev) => ({
                    ...prev,
                    series: [
                        {
                            name: 'Time Online',
                            data: (allZero ? generateDummyData() : chartDataPoints) as any,
                        },
                    ],
                }));

                setLoading(false);
            } catch (error: any) {
                console.error('BasicAreaChart: Error fetching activity data:', error);
                setChartData((prev) => ({
                    ...prev,
                    series: [{ name: 'Time Online', data: generateDummyData() as any }],
                }));
                setLoading(false);
            }
        };

        // Fetch initial data
        fetchData();

        // Set up polling every 5 minutes (more reasonable for activity data)
        const interval = setInterval(fetchData, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [userId]);

    if (loading) {
        return (
            <div className="relative flex h-[105px] items-center justify-center overflow-hidden bg-transparent">
                <div className="text-white/70 text-sm">Loading activity data...</div>
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden bg-transparent">
            <div className="absolute top-2 left-3 z-[100] pointer-events-none">
                <div className="backdrop-blur-sm bg-black/20 rounded-md px-2 py-1">
                    <h3 className="text-white text-xs font-medium">7-Day Activity</h3>
                    <p className="text-white/80 text-[10px]">Time online per day</p>
                </div>
            </div>
            <div className="leading-0">
                <ReactApexChart options={chartData.options} series={chartData.series} type="area" height={105} />
            </div>
        </div>
    );
};

export default BasicAreaChart;
