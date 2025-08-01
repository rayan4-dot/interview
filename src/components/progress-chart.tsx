
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig } from "@/components/ui/chart"

const chartData = [
  { session: "1", clarity: 65, confidence: 60, relevance: 55 },
  { session: "2", clarity: 70, confidence: 65, relevance: 60 },
  { session: "3", clarity: 72, confidence: 75, relevance: 68 },
  { session: "4", clarity: 80, confidence: 78, relevance: 75 },
  { session: "5", clarity: 85, confidence: 82, relevance: 80 },
]

const chartConfig = {
  clarity: {
    label: "Clarity",
    color: "hsl(var(--chart-1))",
  },
  confidence: {
    label: "Confidence",
    color: "hsl(var(--chart-2))",
  },
  relevance: {
    label: "Relevance",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function ProgressChart() {
  return (
    <div className="h-[250px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="session"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `Session ${value}`}
            />
            <YAxis
                domain={[0, 100]}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="clarity" fill="var(--color-clarity)" radius={4} />
            <Bar dataKey="confidence" fill="var(--color-confidence)" radius={4} />
            <Bar dataKey="relevance" fill="var(--color-relevance)" radius={4} />
          </BarChart>
        </ChartContainer>
    </div>
  )
}
