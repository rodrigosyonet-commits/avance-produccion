"use client";

import { useState } from "react";

import EmpresaSelector from "@/components/EmpresaSelector";
import MesSelector from "@/components/MesSelector";
import DataTable from "@/components/DataTable";

export default function Home() {
  const [usuario, setUsuario] = useState(
    "sistemas1.qsitservices@gmail.com"
  );

  const [empresa, setEmpresa] = useState(
    "SCM180807MS9"
  );

  const [mes, setMes] = useState(() => {
    const fecha = new Date();

    return (
      fecha.getFullYear().toString() +
      String(fecha.getMonth() + 1).padStart(2, "0")
    );
  });

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function consultar() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/consulta",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            usuario,
            empresa,
            mes,
          }),
        }
      );

 const json = await response.json();

console.log("STATUS:", response.status);
console.log("RESPUESTA:", json);

alert(JSON.stringify(json, null, 2));

setData(
  Array.isArray(json)
    ? json
    : json.data || []
);
    } catch (error) {
      console.error(error);

      alert(
        "Error al consultar SiNube"
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Avance de Producción
        </h1>

        <p className="text-slate-500 mt-1">
          Consulta manual de producción
          por empresa.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Usuario
            </label>

            <input
              type="email"
              value={usuario}
              onChange={(e) =>
                setUsuario(
                  e.target.value
                )
              }
              className="w-full rounded-lg border p-2"
            />
          </div>

          <EmpresaSelector
            value={empresa}
            onChange={setEmpresa}
          />

          <MesSelector
            value={mes}
            onChange={setMes}
          />
        </div>

        <div className="mt-4">
          <button
            onClick={consultar}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:bg-slate-400"
          >
            {loading
              ? "Consultando..."
              : "Consultar"}
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Resultados
          </h2>

          <DataTable data={data} />
        </div>
      )}

      {!loading &&
        data.length === 0 && (
          <div className="border border-dashed rounded-xl p-10 text-center text-slate-500">
            Selecciona una empresa y
            presiona Consultar.
          </div>
        )}
    </main>
  );
}
