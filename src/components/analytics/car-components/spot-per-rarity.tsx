"use client"
import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import supabase from "../../../../utils/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  desktop: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// Interface mise à jour pour correspondre à la structure exacte de Supabase
interface CollectionData {
  id: string;
  model_id: number;
  models: {
    rarity: string;
  };
}

interface ChartData {
  rarity: string;
  desktop: number;
}

const SpotPerRarity = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_collections')
          .select(`
            id,
            model_id,
            models(
              rarity
            )
          `);

        if (error) throw error;

        // Transformation des données avec le type correct
        const rarityCount = data.reduce((acc, item) => {
          // Accès au premier élément du tableau models s'il existe
          const rarity = item.models.rarity.toLowerCase() || 'Unknown';
          acc[rarity] = (acc[rarity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);


        const formattedData = Object.entries(rarityCount).map(([rarity, count]) => ({
          rarity,
          desktop: count
        }));

        // Tri des données par rareté
        const rarityOrder = ['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'mythic'];
        formattedData.sort((a, b) =>
          rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
        );

        setChartData(formattedData);

      } catch (err) {
        console.error("Error fetching rarity distribution:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Distribution des voitures par rareté</CardTitle>
        <CardDescription>Vue d'ensemble de la collection</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rarity"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Distribution des voitures par niveau de rareté
        </div>
      </CardFooter>
    </Card>
  );
};

export default SpotPerRarity;
