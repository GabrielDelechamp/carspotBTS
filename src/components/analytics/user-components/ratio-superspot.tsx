import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import supabase from '../../../../utils/supabase';

"use client"


import {
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


const chartConfig = {
  superspot: {
    label: "Superspot",
    color: "hsl(var(--chart-1))",
  },
  spot: {
    label: "Spot",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig


const RatioSuperspot = () => {

  const [totalSpots, setTotalSpots] = useState(0);
  const [totalsuperSpots, setTotalsuperSpots] = useState(0);
  const [, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchTotalSpots = async () => {
      try {
        const { count: spotsCount, error: spotsError } = await supabase
          .from('user_collections')
          .select('*', { count: 'exact', head: true });

        if (spotsError) throw spotsError;

        setTotalSpots(spotsCount ?? 0);
      } catch (error) {
        console.error('Error fetching total spots:', error);
        setTotalSpots(0);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalSuperSpots = async () => {
      try {
        const { count: superspotsCount, error: superspotsError } = await supabase
          .from('user_collections')
          .select('*', { count: 'exact', head: true })
          .eq('superspot', true);

        if (superspotsError) throw superspotsError;

        setTotalsuperSpots(superspotsCount ?? 0);
      } catch (error) {
        console.error('Error fetching total spots:', error);
        setTotalsuperSpots(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTotalSpots();
    fetchTotalSuperSpots();
  }, []);


  const chartData = [{ month: "january", superspot: totalsuperSpots, spot: (totalSpots-totalsuperSpots)}]

  const RatioSuperspot =  Math.floor(((chartData[0].superspot*100) / chartData[0].spot)*100)/100 + '%'


  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Super Spot Ratio</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {RatioSuperspot.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Superspot Ratio
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="superspot"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-superspot)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="spot"
              fill="var(--color-spot)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
};

export default RatioSuperspot;






