import React from "react";
import { pie, arc, PieArcDatum } from "d3";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

type DataItem = {
    name: string;
    value: number;
    percentage: number;
    colorFrom: string;
    colorTo: string;
};

interface PieChartProps {
    data: DataItem[];
}

export function Live3_PieChartLabels({ data }: PieChartProps) {
    // Chart dimensions - Adaptable radius
    const radius = Math.PI * 70; // Reducido para mejor ajuste
    const gap = 0.02; // Gap between slices

    // Pie layout and arc generator
    const pieLayout = pie<DataItem>()
        .sort(null)
        .value((d) => d.value)
        .padAngle(gap); // Creates a gap between slices

    const arcGenerator = arc<PieArcDatum<DataItem>>()
        .innerRadius(20)
        .outerRadius(radius)
        .cornerRadius(8);

    const labelRadius = radius * 0.8;
    const arcLabel = arc<PieArcDatum<DataItem>>().innerRadius(labelRadius).outerRadius(labelRadius);

    const arcs = pieLayout(data);
    // Calculate the angle for each slice
    const computeAngle = (d: PieArcDatum<DataItem>) => {
        return ((d.endAngle - d.startAngle) * 180) / Math.PI;
    };

    // Minimum angle to display text
    const MIN_ANGLE = 20;

    return (
        <div className="w-full h-full flex items-center justify-center gap-6">
            {/* Pie Chart */}
            <div className="relative w-full h-full max-w-[200px] max-h-[200px] flex items-center justify-center flex-shrink-0">
                <svg
                    viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Slices */}
                    {arcs.map((d, i) => {
                        const midAngle = (d.startAngle + d.endAngle) / 2;

                        return (
                            <ClientTooltip key={i}>
                                <TooltipTrigger>
                                    <g key={i}>
                                        <path fill={`url(#pieColors-${i})`} d={arcGenerator(d)!} />
                                        <linearGradient
                                            id={`pieColors-${i}`}
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="0"
                                            gradientTransform={`rotate(${(midAngle * 180) / Math.PI - 90}, 0.5, 0.5)`}
                                        >
                                            <stop offset="0%" stopColor={d.data.colorFrom} />
                                            <stop offset="100%" stopColor={d.data.colorTo} />
                                        </linearGradient>
                                    </g>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div>{d.data.name}</div>
                                    <div className="text-gray-400 text-sm">
                                        {d.data.percentage.toFixed(1)}%
                                    </div>
                                </TooltipContent>
                            </ClientTooltip>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 overflow-y-auto pr-2 max-h-full">
                <div className="space-y-2">
                    {data.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div
                                className="w-4 h-4 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: item.colorFrom }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.name}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="text-sm font-semibold text-gray-700">
                                    {item.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
