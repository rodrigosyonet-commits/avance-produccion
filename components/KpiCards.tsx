
interface KpiCardsProps {
  totalOrdenes: number;
  totalPlaneado: number;
  totalProducido: number;
  avancePromedio: number;
  terminadas: number;
  enProceso: number;
}

export default function KpiCards({
  totalOrdenes,
  totalPlaneado,
  totalProducido,
  avancePromedio,
  terminadas,
  enProceso,
}: KpiCardsProps) {
  const cards = [
    {
      titulo: "Órdenes Totales",
      valor: totalOrdenes.toLocaleString(),
      color: "bg-blue-600",
    },
    {
      titulo: "Cantidad Planeada",
      valor: totalPlaneado.toLocaleString(),
      color: "bg-indigo-600",
    },
    {
      titulo: "Cantidad Producida",
      valor: totalProducido.toLocaleString(),
      color: "bg-green-600",
    },
    {
      titulo: "Avance Promedio",
      valor: `${avancePromedio.toFixed(2)}%`,
      color: "bg-amber-600",
    },
    {
      titulo: "Terminadas",
      valor: terminadas.toLocaleString(),
      color: "bg-emerald-600",
    },
    {
      titulo: "En Proceso",
      valor: enProceso.toLocaleString(),
      color: "bg-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className={`${card.color} rounded-xl p-5 text-white shadow-lg`}
        >
          <div className="text-sm font-medium opacity-90">
            {card.titulo}
          </div>

          <div className="mt-2 text-3xl font-bold">
            {card.valor}
          </div>
        </div>
      ))}
    </div>
  );
}
