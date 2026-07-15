"use client";

import { useEffect, useMemo, useState } from "react";

import EmpresaSelector from "@/components/EmpresaSelector";
import MesSelector from "@/components/MesSelector";
import KpiCards from "@/components/KpiCards";
import DataTable from "@/components/DataTable";
import ProduccionChart from "@/components/ProduccionChart";

export default function Page() {
  const [usuario, setUsuario] = useState(
    "sistemas1.qsitservices@gmail.com"
  );

  const [empresa, setEmpresa] = useState("jugos");
  const [mes, setMes] = useState("202607");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<any[]>([]);
  const [debug, setDebug] = useState<any>(null);

  async function consultar() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/consulta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario,
          empresaId: empresa,
          mes,
        }),
      });

      const json = await response.json();

      setDebug(json);

      if (!response.ok) {
        throw new Error(
          json.error || "Error al consultar SiNube"
        );
      }

      setData(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const kpis = useMemo(() => {
    const totalOrdenes = data.length;

    const totalPlaneado = data.reduce(
      (sum, item) =>
        sum + Number(item.cantidadProducir || 0),
      0
    );

    const totalProducido = data.reduce(
      (sum, item) =>
        sum + Number(item.cantidadProducida || 0),
      0
    );

    const avancePromedio =
      totalOrdenes > 0
        ? data.reduce(
            (sum, item) =>
              sum + Number(item.avance || 0),
            0
          ) / totalOrdenes
        : 0;

    const terminadas = data.filter(
      (item) => item.estado === "🟢 Completa"
    ).length;

    const enProceso = data.filter(
      (item) => item.estado === "🟡 Parcial"
    ).length;

    return {
      totalOrdenes,
      totalPlaneado,
      totalProducido,
      avancePromedio,
      terminadas,
      enProceso,
    };
  }, [data]);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900">
            Avance de Producción
          </h1>

          <p className="mt-2 text-slate-600">
            Consulta de producción SiNube por
            empresa
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Usuario SiNube
              </label>

              <input
                type="email"
                value={usuario}
                onChange={(e) =>
                  setUsuario(e.target.value)
                }
                className="w-full rounded-lg border p-3"
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

            <div className="flex items-end">
              <button
                onClick={consultar}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Consultando..."
                  : "Consultar"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6">
          <KpiCards
            totalOrdenes={kpis.totalOrdenes}
            totalPlaneado={kpis.totalPlaneado}
            totalProducido={kpis.totalProducido}
            avancePromedio={
              kpis.avancePromedio
            }
            terminadas={kpis.terminadas}
            enProceso={kpis.enProceso}
          />
        </div>

        {data.length > 0 && (
          <>
            <div className="mb-6">
              <ProduccionChart
                data={data}
              />
            </div>

            <div className="mb-6 rounded-xl bg-white p-4 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Detalle de Producción
              </h2>

              <DataTable data={data} />
            </div>
          </>
        )}

        <div className="rounded-xl bg-slate-900 p-4 text-white shadow">
          <h2 className="mb-4 text-lg font-semibold">
            Debug Consulta
          </h2>

          <pre className="overflow-auto text-xs">
            {JSON.stringify(
              debug,
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </main>
  );
}
