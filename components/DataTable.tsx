
type DataTableProps = {
  data: Record<string, any>[];
};

export default function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-slate-500">
        No hay datos para mostrar.
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b px-4 py-3 text-left font-semibold text-slate-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-slate-50"
            >
              {columns.map((column) => (
                <td
                  key={column}
                  className="border-b px-4 py-3 text-slate-700"
                >
                  {renderCell(row[column], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(value: any, column: string) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (column === "% Avance") {
    return (
      <span className="font-semibold">
        {Number(value).toFixed(2)}%
      </span>
    );
  }

  if (column === "Estado") {
    const estado = String(value);

    let color =
      "bg-slate-100 text-slate-700";

    if (estado.includes("Sin producir")) {
      color = "bg-red-100 text-red-700";
    }

    if (estado.includes("Parcial")) {
      color = "bg-yellow-100 text-yellow-700";
    }

    if (estado.includes("Completa")) {
      color = "bg-green-100 text-green-700";
    }

    if (estado.includes("Sobreproducción")) {
      color = "bg-blue-100 text-blue-700";
    }

    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${color}`}
      >
        {estado}
      </span>
    );
  }

  return String(value);
}
