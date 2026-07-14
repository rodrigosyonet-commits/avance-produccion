
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type ProduccionChartProps = {
  data: Record<string, any>[];
};

export default function ProduccionChart({
  data,
}: ProduccionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-slate-500">
        Sin información para mostrar.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    folio:
      item.folioOrden ||
      item.Folio ||
      item.folio ||
      "N/D",

    planeado:
      Number(
        item["Cantidad a Producir"] || 0
      ),

    producido:
      Number(
        item["Cantidad Producida"] || 0
      ),
  }));

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Producción por Orden
      </h2>

      <div className="h-[450px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="folio"
              angle={-45}
              textAnchor="end"
              height={100}
            />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="planeado"
              name="Cantidad a Producir"
              fill="#2563eb"
            />

            <Bar
              dataKey="producido"
              name="Cantidad Producida"
              fill="#16a34a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
