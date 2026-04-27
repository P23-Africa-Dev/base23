import { Area, AreaChart, DotProps, Line, ResponsiveContainer } from 'recharts';

/* =====================
   Types
===================== */
type MonthData = {
    month: string;
    value: number;
    isCurrent?: boolean;
};

/* =====================
   Base data (API-friendly)
===================== */
const monthlyData: MonthData[] = [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 20 },
    { month: 'Mar', value: 5 },
    { month: 'Apr', value: 20 },
    { month: 'May', value: 15 },
    { month: 'Jun', value: 25 },
    { month: 'Jul', value: 5 },
    { month: 'Aug', value: 10 },
    { month: 'Sep', value: 45 },
    { month: 'Oct', value: 50 },
    { month: 'Nov', value: 30 },
    { month: 'Dec', value: 45 },
];

/* =====================
   Helpers
===================== */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getChartData = (): MonthData[] => {
    const currentMonthIndex = new Date().getMonth();

    return monthlyData.map((item, index) => ({
        ...item,
        isCurrent: index === currentMonthIndex,
    }));
};

const getWrappedIndex = (index: number, length: number) => {
    return (index + length) % length;
};

const getVisibleMonths = (data: MonthData[]) => {
    const length = data.length;
    const currentIndex = data.findIndex((m) => m.isCurrent);

    // offsets: -2, -1, 0, +1, +2
    return [-2, -1, 0, 1, 2].map((offset) => {
        const wrappedIndex = getWrappedIndex(currentIndex + offset, length);
        return data[wrappedIndex];
    });
};

/* =====================
   Current Month Dot
===================== */
const CurrentMonthDot = (props: DotProps & { payload?: MonthData }) => {
    const { cx, cy, payload } = props;

    if (!payload?.isCurrent) return null;

    return <circle cx={cx} cy={cy} r={6} fill="#FF4D8D" stroke="#ffffff" strokeWidth={2} />;
};

/* =====================
   Component
===================== */
const MatchingHistoryChart = () => {
    const chartData = getChartData();

    //  circular 5-month window
    const visibleMonths = getVisibleMonths(chartData);

    return (
        <div className="h-[90px] w-full rounded-2xl bg-white shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)]">
            {/* Header */}
            <h4 className="mb-2 pt-4 pl-5 text-[11px] font-semibold text-gray-800">Matching History</h4>

            {/* Chart */}
            <div className="h-[20px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visibleMonths}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#8D57FB" />
                                <stop offset="100%" stopColor="#5667F6" />
                            </linearGradient>

                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="-28.27%" stopColor="#8D57FB" />
                                <stop offset="-28.27%" stopColor="rgba(191,160,254,0.99)" />
                                <stop offset="67.93%" stopColor="rgba(86,103,246,0.248253)" />
                                <stop offset="100%" stopColor="rgba(51,84,244,0.0001)" />
                            </linearGradient>
                        </defs>

                        <Area type="monotone" dataKey="value" stroke="none" fill="url(#areaGradient)" />

                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="url(#lineGradient)"
                            strokeWidth={2.5}
                            dot={<CurrentMonthDot />}
                            activeDot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Month labels */}
            {/* Labels */}
            <div className="mt-2 flex justify-center gap-2 text-xs">
                {visibleMonths.map((item) => (
                    <span
                        key={item.month}
                        className={`px-2 py-[2px] text-[9px] transition-all ${item.isCurrent ? 'rounded-full bg-[#8D57FB] text-white' : 'text-gray-400'}`}
                    >
                        {item.month}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default MatchingHistoryChart;
