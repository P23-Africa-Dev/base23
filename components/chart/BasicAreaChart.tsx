"use client";

/**
 * BasicAreaChart — Activity sparkline for the dashboard hero card.
 *
 * Perf optimisations applied:
 * 1. react-apexcharts is dynamically imported with `ssr: false` so it is
 *    code-split out of the critical bundle and doesn't block hydration.
 * 2. When the auth-bypass flag is active (dev mode, no local backend),
 *    we resolve immediately with dummy data instead of hammering a dead
 *    socket and waiting 5–7 s for a TCP timeout.
 * 3. All axios calls carry a hard 1 200 ms timeout so a slow / absent
 *    backend never freezes the UI.
 * 4. console.log traces stripped from the production path.
 */

import dynamic from "next/dynamic";
import { subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import axios from "@/lib/axios-config";
import { TEMP_AUTH_BYPASS } from "@/lib/temp-auth-bypass";

// ─── Lazy-load ApexCharts — keeps it out of the main JS bundle ──────────────
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChartProps {
  userId?: number;
}

// ─── Dummy data — deterministic seed so SSR & client match ──────────────────
const DUMMY_DATA = [56, 89, 44, 67, 59, 87, 100];

const generateDummyData = () => {
  const today = new Date();
  return DUMMY_DATA.map((y, i) => ({
    x: subDays(today, 6 - i).getTime(),
    y,
  }));
};

// ─── Shared chart options (stable reference — never recreated) ───────────────
const CHART_OPTIONS = {
  chart: {
    type: "area" as const,
    height: 350,
    zoom: { enabled: false },
    toolbar: { show: false },
    sparkline: { enabled: true },
    parentHeightOffset: 0,
    offsetY: 5,
    animations: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" as const, width: 2 },
  fill: {
    type: "pattern",
    pattern: { style: "verticalLines", width: 6, height: 6, strokeWidth: 2 },
  },
  markers: {
    size: 0,
    colors: ["#ffffff"],
    strokeColors: "#ffffff",
    strokeWidth: 2,
    hover: { size: 6 },
  },
  colors: ["#ffffff"],
  labels: [] as string[],
  xaxis: {
    type: "datetime" as const,
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { show: false },
  grid: { show: false },
  tooltip: {
    enabled: true,
    theme: "dark" as const,
    x: { format: "dd MMM yyyy" },
    y: {
      formatter: (value: number) => {
        if (value >= 60) {
          const hours = Math.floor(value / 60);
          const mins = value % 60;
          return mins > 0 ? `${hours}h ${mins}m online` : `${hours}h online`;
        }
        return `${value} minutes online`;
      },
    },
  },
  legend: { show: false },
};

// ─── Skeleton placeholder while ApexCharts chunk loads ──────────────────────
function ChartSkeleton() {
  return (
    <div className="relative flex h-26 w-full items-end gap-[3px] overflow-hidden px-2 pb-1 opacity-40">
      {DUMMY_DATA.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-white/50"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
const BasicAreaChart: React.FC<ChartProps> = ({ userId }) => {
  const [series, setSeries] = useState([
    { name: "Time Online", data: generateDummyData() },
  ]);
  // Start as NOT loading when bypass is active — we already have dummy data
  const [loading, setLoading] = useState(!TEMP_AUTH_BYPASS);

  useEffect(() => {
    // ── Fast-path: no backend in dev/bypass mode ─────────────────────────
    if (TEMP_AUTH_BYPASS) {
      // Already initialised with dummy data — nothing to fetch
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const apiUrl = userId ? `/api/user/${userId}` : "/api/user";
        const response = await axios.get(apiUrl, { timeout: 1200 });
        if (cancelled) return;

        const { data } = response.data;
        const today = new Date();
        const chartPoints = Array.from({ length: 7 }, (_, i) => {
          const d = subDays(today, 6 - i);
          const key = d.toISOString().slice(0, 10);
          return { x: d.getTime(), y: (data[key] as number) || 0 };
        });

        const allZero = chartPoints.every((p) => p.y === 0);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSeries([{ name: "Time Online", data: (allZero ? generateDummyData() : chartPoints) as any }]);
      } catch {
        // Timeout / network error — silently fall back to dummy data
        // (dummy data was already set as initial state)
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  if (loading) return <ChartSkeleton />;

  return (
    <div className="relative w-full overflow-hidden bg-transparent">
      <div className="absolute left-12 top-3.5 z-100 pointer-events-none">
        <h3 className="text-[#58E9B8E5] text-[8px]">Weekly</h3>
        <div className="flex items-center gap-4">
          <p className="text-[#F3F0E9] text-[10px] font-medium">Growth</p>
          <p className="text-[#0B1727] text-[15.33px] font-medium">+3.4%</p>
        </div>
      </div>
      <div className="leading-0">
        <ReactApexChart
          options={CHART_OPTIONS}
          series={series}
          type="area"
          height={105}
        />
      </div>
    </div>
  );
};

export default BasicAreaChart;
