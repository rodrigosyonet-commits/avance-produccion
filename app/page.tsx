"use client";

import { useMemo, useState } from "react";

import EmpresaSelector from "@/components/EmpresaSelector";
import MesSelector from "@/components/MesSelector";
import KpiCards from "@/components/KpiCards";
import ProduccionChart from "@/components/ProduccionChart";
import DataTable from "@/components/DataTable";

interface ApiResponse {
  success?: boolean;
  data?: any[];
  debug?: any;
  error?: string;
}

export default function Page() {
  const [usuario, setUsuario] = useState(
    "sistemas1.qsitservices@gmail.com"
  );

  const [empresa, setEmpresa] = useState("jugos");

  const [mes, setMes] = useState(
    new Date().getFullYear().toString() +
      String(new Date().getMonth() + 1).padStart(
        2,
        "0"
      )
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [data, setData] = useState<any[]>([]);

  const [debug, setDebug] = useState<any>(null);

  const consultar = async () => {
    const payload = {
      usuario,
      empresaId: empresa,
      mes,
    };

    setLoading(true);
    setError("");
    setData([]);

    try {
      setDebug({
        estado: "INICIO_CONSULTA",
        fecha: new Date().toISOString(),
        payload,
      });

      const response = await fetch(
        "/api/consulta",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const responseText =
        await response.text();

      let result: ApiResponse;

      try {
        result =
          JSON.parse(responseText);
      } catch {
        setDebug({
          estado:
            "ERROR_JSON_INVALIDO",
          payload,
          responseStatus:
            response.status,
          responseOk:
            response.ok,
          responseText:
            responseText.substring(
              0,
              5000
            ),
        });

        throw new Error(
          "La API devolvió HTML o texto plano en lugar de JSON."
        );
      }

      setDebug({
        responseStatus:
          response.status,
        responseOk:
          response.ok,
        ...(result.debug ??
          result),
      });

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.debug?.error ||
            "Error al consultar API"
        );
      }

      setData(
        Array.isArray(
          result.data
        )
          ? result.data
          : []
      );
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "Error desconocido";

      setError(mensaje);

      setDebug((prev: any) => ({
        ...(prev ?? {}),
        errorFrontend:
          mensaje,
      }));

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = useMemo(() => {
    const totalOrdenes =
      data.length;

    const totalPlaneado =
      data.reduce(
        (sum, row) =>
          sum +
          Number(
            row.cantidadProducir ||
              0
          ),
        0
      );

    const totalProducido =
      data.reduce(
        (sum, row) =>
          sum +
          Number(
            row.cantidadProducida ||
              0
          ),
        0
      );

    const avancePromedio =
      totalOrdenes > 0
        ? data.reduce(
            (sum, row) =>
              sum +
              Number(
                row.avance || 0
              ),
            0
          ) / totalOrdenes
        : 0;

    const terminadas =
      data.filter(
        (row) =>
          row.estado ===
          "🟢 Completa"
      ).length;

    const enProceso =
      data.filter(
        (row) =>
          row.estado ===
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Avance de Producción
          </h1>

          <p className="mt-2 text-slate-600">
            Consulta manual
            de producción
            desde SiNube
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
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
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <EmpresaSelector
              value={empresa}
              onChange={
                setEmpresa
              }
            />

            <MesSelector
              value={mes}
              onChange={setMes}
            />

            <div className="flex items-end">
              <button
                onClick={
                  consultar
                }
                disabled={
                  loading
                }
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
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="font-bold text-red-700">
              Error
            </div>

            <div className="mt-2 text-red-600">
              {error}
            </div>
          </div>
        )}

        <div className="mb-6">
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
        </div>

        {data.length > 0 && (
          <>
            <div className="mb-6 rounded-xl bg-white p-4 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Producción
              </h2>

              <ProduccionChart
                data={data}
              />
            </div>

            <div className="mb-6 rounded-xl bg-white p-4 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Detalle de
                Producción
              </h2>

              <DataTable
                data={data}
              />
            </div>
          </>
        )}

        <div className="rounded-xl bg-slate-900 p-4 text-white shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Debug Completo
            </h2>

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(
                    debug,
                    null,
                    2
                  )
                )
              }
              className="rounded bg-slate-700 px-3 py-1 text-xs"
            >
              Copiar Debug
            </button>
          </div>

          <pre className="max-h-[700px] overflow-auto whitespace-pre-wrap text-xs">
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
