import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface MessageStatsChartProps {
    messageStats: {
        unread_messages: number;
        read_messages: number;
        sent_messages: number;
        received_messages: number;
        total_conversations: number;
        response_rate: number;
        recent_activity: number;
    };
    isLoading?: boolean;
}

const MessageStatsChart: React.FC<MessageStatsChartProps> = ({ messageStats, isLoading = false }) => {
    const totalMessages = messageStats.read_messages + messageStats.unread_messages;

    const pieData = [
        {
            name: 'Read Messages',
            key: 'read',
            value: messageStats.read_messages,
            color: '#A47AF0', // light purple
        },
        {
            name: 'Unread Messages',
            key: 'unread',
            value: messageStats.unread_messages,
            color: '#193E47', // dark teal
        },
    ];

    // ✅ Custom label renderer — matches CustomTooltip logic and uses dynamic text color
    const renderLabel = (props: any) => {
        const { cx, cy, midAngle, outerRadius, name, value, payload } = props;
        const RADIAN = Math.PI / 180;
        const radius = outerRadius * 0.65;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        const percentage = totalMessages > 0 ? ((value / totalMessages) * 100).toFixed(1) : '0';

        const isRead = payload.key === 'read';
        const textColor = isRead ? '#000000' : '#FFFFFF';

        // Offset x slightly to make left alignment more natural
        const labelX = x - -5; // adjust offset as needed

        return (
            <text
                x={labelX}
                y={y}
                fill={textColor}
                textAnchor="middle" // ✅ aligns text to the left
                dominantBaseline="no-change"
                className="text-[9px] leading-tight font-semibold"
            >
                {percentage}%
                <tspan x={labelX} dy="1.1em">
                    {name}
                </tspan>
            </text>
        );
    };

    // Custom Tooltip (same as yours)
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = totalMessages > 0 ? ((data.value / totalMessages) * 100).toFixed(1) : '0';
            return (
                <div className="rounded border bg-white p-2 shadow-lg">
                    <p className="text-sm font-medium">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        {data.value} messages ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (totalMessages === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                <div className="mb-1 text-gray-400">
                    <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <p className="text-xs text-gray-500">No messages yet</p>
                <p className="mt-0.5 text-[10px] text-gray-400">Start connecting!</p>
            </div>
        );
    }

    return (
        <div className="relative flex h-full w-full flex-col">
            <div className="relative min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderLabel}
                            outerRadius="100%"
                            dataKey="value"
                            paddingAngle={1.5}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* White Circle at Center */}
                <div className="absolute top-[48%] left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md"></div>
            </div>
        </div>
    );
};

export default MessageStatsChart;
