"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import supabase from "../../../../utils/supabase";

interface RawHeatmapData {
  day_of_week: number;
  hour_of_day: number;
  count: number;
}

const Heatmap = () => {
  const [data, setData] = useState<number[][]>(Array(7).fill(null).map(() => Array(24).fill(0)));
  const [maxValue, setMaxValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const hours = Array(24).fill(null).map((_, i) => `${String(i).padStart(2, "0")}h`);

  const getColor = useMemo(() => (value: number) => {
    const intensity = value / maxValue;
    return `rgb(${Math.round(255 * (1 - intensity))}, ${Math.round(255 * (1 - intensity))}, 255)`;
  }, [maxValue]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Requête pour utiliser la syntaxe correcte de Supabase
        const { data: rawData, error: supabaseError } = await supabase
          .rpc('get_spot_frequency_heatmap')
          .returns<RawHeatmapData[]>();

        if (supabaseError) throw supabaseError;

        // Initialiser le tableau avec des zéros
        const heatmapData = Array(7)
          .fill(null)
          .map(() => Array(24).fill(0));

        if (rawData && Array.isArray(rawData)) {
          rawData.forEach((row) => {
            // Vérifier que row existe et contient les propriétés nécessaires
            if (row && 
                typeof row.day_of_week === 'number' && 
                typeof row.hour_of_day === 'number' &&
                row.day_of_week >= 0 &&
                row.day_of_week < 7 &&
                row.hour_of_day >= 0 &&
                row.hour_of_day < 24) {
              heatmapData[row.day_of_week][row.hour_of_day] = row.count || 0;
            } else {
              // Log pour débogage
              console.warn("Données ignorées:", row);
            }
          });
        } else {
          console.warn("Format de données inattendu:", rawData);
        }

        setData(heatmapData);
        const max = Math.max(...heatmapData.flat());
        setMaxValue(max || 1);
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError("Impossible de charger les données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-fit">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-gray-500">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-fit">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-fit">
      <Card>
        <CardHeader>
          <CardTitle>Analyse de fréquentation par jour et heure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex">
            <div className="flex flex-col mr-2">
              <div className="h-8" />
              {days.map((day) => (
                <div key={day} className="h-12 flex items-center font-medium min-w-24">
                  {day}
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <div className="inline-block">
                <div className="flex mb-2">
                  {hours.map((hour) => (
                    <div key={hour} className="w-12 text-center">
                      {hour}
                    </div>
                  ))}
                </div>
                {data.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((value, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="w-12 h-12 flex items-center justify-center border border-gray-200"
                        style={{
                          backgroundColor: getColor(value),
                          color: value > maxValue / 2 ? "white" : "black",
                        }}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Heatmap;