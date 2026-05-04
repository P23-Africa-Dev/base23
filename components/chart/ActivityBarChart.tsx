// 'use client';

// import { Group } from '@visx/group';
// import { scaleBand, scaleLinear } from '@visx/scale';
// import { Text } from '@visx/text';

// type Props = {
//     data: { day: string; value: number }[];
// };

// export default function ActivityBarChart({ data }: Props) {
//     const width = 600;
//     const height = 281;

//     // ⬅ Increased left padding for Y-axis labels
//     const padding = { top: 10, bottom: 40, left: 52, right: 20 };

//     const xScale = scaleBand({
//         domain: data.map((d) => d.day),
//         padding: 0.3,
//         range: [padding.left, width - padding.right],
//     });

//     const yScale = scaleLinear({
//         domain: [0, 100],
//         range: [height - padding.bottom, padding.top],
//     });

//     const yTicks = [25, 50, 75, 100];

//     return (
//         <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
//             {/* Y-axis grid lines + labels */}
//             {yTicks.map((val) => (
//                 <Group key={val}>
//                     {/* Grid line */}
//                     <line
//                         x1={padding.left}
//                         x2={width - padding.right}
//                         y1={yScale(val)}
//                         y2={yScale(val)}
//                         stroke="#94A3B8"
//                         strokeDasharray="4 4"
//                         strokeOpacity={0.4}
//                     />

//                     {/* Y-axis label */}
//                     <Text x={padding.left - 10} y={yScale(val) + 4} textAnchor="end" fill="#0B1727" fontSize={11} fontWeight={500}>
//                         {`${val}%`}
//                     </Text>
//                 </Group>
//             ))}

//             {/* Bottom baseline */}
//             <line x1={padding.left} x2={width - padding.right} y1={yScale(0)} y2={yScale(0)} stroke="#0B1727" strokeWidth={2} />

//             <Group>
//                 {data.map((d, i) => {
//                     const barWidth = xScale.bandwidth();
//                     const x = xScale(d.day)!;

//                     const barHeight = yScale(0) - yScale(d.value);
//                     const radius = Math.min(barWidth / 2, 32);

//                     const ghostHeight = yScale(0) - yScale(100);
//                     const ghostRadius = barWidth / 2;

//                     const clipId = `clip-top-rounded-${i}`;

//                     return (
//                         <Group key={d.day}>
//                             {/* ClipPath for top-only rounded bar */}
//                             <defs>
//                                 <clipPath id={clipId}>
//                                     <path
//                                         d={`
//                       M ${x},${yScale(d.value) + radius}
//                       a ${radius},${radius} 0 0 1 ${radius},-${radius}
//                       h ${barWidth - radius * 2}
//                       a ${radius},${radius} 0 0 1 ${radius},${radius}
//                       v ${barHeight - radius}
//                       h -${barWidth}
//                       Z
//                     `}
//                                     />
//                                 </clipPath>
//                             </defs>

//                             {/* Ghost bar */}
//                             <rect
//                                 x={x}
//                                 y={yScale(100)}
//                                 width={barWidth}
//                                 height={ghostHeight}
//                                 rx={ghostRadius}
//                                 ry={ghostRadius}
//                                 fill="#AABDB8"
//                                 opacity={0.45}
//                             />

//                             {/* Actual bar */}
//                             <rect x={x} y={yScale(d.value)} width={barWidth} height={barHeight} fill="#0B1727" clipPath={`url(#${clipId})`} />

//                             {/* Percentage label */}
//                             <Text x={x + barWidth / 2} y={yScale(d.value) + 16} textAnchor="middle" fill="white"  fontSize={12} fontWeight={600}>
//                                 {`${d.value}%`}
//                             </Text>

//                             {/* Day label */}
//                             <Text x={x + barWidth / 2} y={height - 12} textAnchor="middle" fill="#0B1727" fontSize={12} fontWeight={500}>
//                                 {d.day}
//                             </Text>
//                         </Group>
//                     );
//                 })}
//             </Group>
//         </svg>
//     );
// }



'use client';

import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';

type Props = {
  data: { day: string; value: number }[];
};

export default function ActivityBarChart({ data }: Props) {
  const width = 600;
  const height = 281;

  /* ------------------------------------------------------------------
     SPACING CONTROL (IMPORTANT)
     👉 Increase `top` to push bars DOWN
     👉 Increase `bottom` for x-label breathing room
  ------------------------------------------------------------------- */
  const padding = {
    top: 12,      // ⬅ chart vertical spacing from top
    bottom: 57,
    left: 52,
    right: 20,
  };

  const xScale = scaleBand({
    domain: data.map((d) => d.day),
    padding: 0.3,
    range: [padding.left, width - padding.right],
  });

  const yScale = scaleLinear({
    domain: [0, 100],
    range: [height - padding.bottom, padding.top],
  });

  const yTicks = [25, 50, 75, 100];

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      {/* Y-axis grid + labels */}
      {yTicks.map((val) => (
        <Group key={val}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={yScale(val)}
            y2={yScale(val)}
            stroke="#94A3B8"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />

          <Text
            x={padding.left - 10}
            y={yScale(val) + 4}
            textAnchor="end"
            fill="#0B1727"
            fontSize={13}
            fontWeight={700}
          >
            {`${val}%`}
          </Text>
        </Group>
      ))}

      {/* Bottom baseline */}
      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={yScale(0)}
        y2={yScale(0)}
        stroke="#0B1727"
        strokeWidth={2}
      />

      <Group>
        {data.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const x = xScale(d.day)!;
          const barHeight = yScale(0) - yScale(d.value);
          const radius = Math.min(barWidth / 2, 28);

          const clipId = `clip-${i}`;

          return (
            <Group key={d.day}>
              <defs>
                <clipPath id={clipId}>
                  <path
                    d={`
                      M ${x},${yScale(d.value) + radius}
                      a ${radius},${radius} 0 0 1 ${radius},-${radius}
                      h ${barWidth - radius * 2}
                      a ${radius},${radius} 0 0 1 ${radius},${radius}
                      v ${barHeight - radius}
                      h -${barWidth}
                      Z
                    `}
                  />
                </clipPath>
              </defs>

              {/* Ghost bar */}
              <rect
                x={x}
                y={yScale(100)}
                width={barWidth}
                height={yScale(0) - yScale(100)}
                rx={barWidth / 2}
                fill="#AABDB8"
                opacity={0.45}
              />

              {/* Actual bar */}
              <rect
                x={x}
                y={yScale(d.value)}
                width={barWidth}
                height={barHeight}
                fill="#0B1727"
                clipPath={`url(#${clipId})`}
              />

              {/* Percentage label
                 👉 Adjust +16 to move text up/down
              */}
              <Text
                x={x + barWidth / 2}
                y={yScale(d.value) + 35}
                textAnchor="middle"
                fill="white"
                letterSpacing={1.5}
                fontSize={12}
                fontWeight={600}
              >
                {`${d.value}%`}
              </Text>

              {/* Day label */}
              <Text
                x={x + barWidth / 2}
                y={height - 30}
                textAnchor="middle"
                fill="#0B1727"
                fontSize={15}
                fontWeight={500}
              >
                {d.day}
              </Text>
            </Group>
          );
        })}
      </Group>
    </svg>
  );
}
