"use client";

import { useMemo, useState } from "react";

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

      const payload = {
        usuario,
        empresaId: empresa,
        mes,
      };

      const response = await fetch(
        "/api/consulta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText =
        await response.text();

      let json: any = null;

      try {
        json = JSON.parse(responseText);
      } catch {
        setDebug({
          enviando: payload,
          status: response.status,
          respuestaRaw: responseText,
          tipo:
            "La API devolvió HTML o texto plano",
        });

        throw new Error(
          "La API no devolvió JSON válido"
        );
      }

      setDebug({
        enviando: payload,
        status: response.status,
        respuesta: json,
      });

      if (!response.ok) {
        throw new Error(
          json.error ??
            "Error al consultar API"
        );
      }

      setData(json.data ?? []);
    } catch (err: any) {
      setError(
        err.message ??
          "Error desconocido"
      );
    } finally {
      setLoading(false);
    }
  }

  const kpis = useMemo(() => {
    const totalOrdenes =
      data.length;

    const totalPlaneado =
      data.reduce(
        (sum, item) =>
          sum +
          Number(
            item.cantidadProducir || 0
          ),
        0
      );

    const totalProducido =
      data.reduce(
        (sum, item) =>
          sum +
          Number(
            item.cantidadProducida || 0
          ),
        0
      );

    const avancePromedio =
      totalOrdenes > 0
        ? data.reduce(
            (sum, item) =>
              sum +
              Number(item.avance || 0),
            0
          ) / totalOrdenes
        : 0;

    const terminadas =
      data.filter(
        (x) =>
          x.estado ===
          "🟢 Completa"
      ).length;

    const enProceso =
      data.filter(
        (x) =>
          x.estado ===
          "🟡 Parcial"
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
        <h1 className="mb-6 text-4xl font-bold">
          Avance de Producción
        </h1>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block">
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
                className="w-full rounded border p-3"
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
                className="w-full rounded bg-blue-600 p-3 text-white"
              >
                {loading
                  ? "Consultando..."
                  : "Consultar"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <KpiCards
          totalOrdenes={
            kpis.totalOrdenes
          }
          totalPlaneado={
            kpis.totalPlaneado
          }
          totalProducido={
            kpis.totalProducido
          }
          avancePromedio={
            kpis.avancePromedio
          }
          terminadas={
            kpis.terminadas
          }
          enProceso={
            kpis.enProceso
          }
        />

        {data.length > 0 && (
          <>
            <div className="mt-6">
              <ProduccionChart
                data={data}
              />
            </div>

            <div className="mt-6 rounded-xl bg-white p-4 shadow">
              <DataTable data={data} />
            </div>
          </>
        )}

        <div className="mt-6 rounded-xl bg-slate-900 p-4 text-white shadow">
          <h2 className="mb-4 text-lg font-bold">
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
