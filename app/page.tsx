"use client";

import { useMemo, useState } from "react";

import EmpresaSelector from "@/components/EmpresaSelector";
import MesSelector from "@/components/MesSelector";
import KpiCards from "@/components/KpiCards";
import ProduccionChart from "@/components/ProduccionChart";
import DataTable from "@/components/DataTable";

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
    setLoading(true);
    setError("");
    setData([]);

    const payload = {
      usuario,
      empresaId: empresa,
      mes,
    };

    try {
      console.clear();

      console.log(
        "===================================="
      );
      console.log("CONSULTA INICIADA");
      console.log(
        "===================================="
      );
      console.log(payload);

      setDebug({
        estado: "ANTES_FETCH",
        enviando: payload,
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

      const rawText =
        await response.text();

      console.log(
        "STATUS API:"
      );
      console.log(response.status);

      console.log(
        "RAW RESPONSE:"
      );
      console.log(rawText);

      let json: any = null;

      try {
        json =
          JSON.parse(rawText);

        console.log(
          "JSON PARSEADO OK"
        );

        console.log(json);
      } catch (parseError) {
        console.error(
          "NO SE PUDO PARSEAR JSON"
        );

        console.error(parseError);

        setDebug({
          estado:
            "ERROR_PARSEANDO_JSON",
          enviando: payload,
          status:
            response.status,
          respuestaRaw:
            rawText,
          headers:
            Object.fromEntries(
              response.headers.entries()
            ),
        });

        throw new Error(
          "La API devolvió HTML o texto plano y no JSON."
        );
      }

      setDebug(
        json.debug ?? json
      );

      if (!response.ok) {
        throw new Error(
          json.error ||
            json.debug?.error ||
            "Error en API"
        );
      }

      if (json.data) {
        setData(json.data);
      } else {
        setData([]);
      }
    } catch (err: any) {
      console.error(
        "ERROR FRONTEND"
      );

      console.error(err);

      setError(
        err.message ||
          "Error desconocido"
      );

      setDebug((prev: any) => ({
        ...(prev || {}),
        errorFrontend:
          err.message,
        stack:
          err.stack,
      }));
    } finally {
      setLoading(false);
    }
  }

  const kpis = useMemo(() => {
    const totalOrdenes =
      data.length;

    const totalPlaneado =
      data.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.cantidadProducir ||
              0
          ),
        0
      );

    const totalProducido =
      data.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.cantidadProducida ||
              0
          ),
        0
      );

    const avancePromedio =
      totalOrdenes > 0
        ? data.reduce(
            (
              sum,
              item
            ) =>
              sum +
              Number(
                item.avance || 0
              ),
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Avance de Producción
          </h1>

          <p className="mt-2 text-slate-600">
            Dashboard de
            Producción SiNube
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block font-medium">
                Usuario
              </label>

              <input
                type="email"
                value={
                  usuario
                }
                onChange={(e) =>
                  setUsuario(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
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
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
            <div className="font-bold">
              Error
            </div>

            <div>{error}</div>
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

        {data.length >
          0 && (
          <>
            <div className="mb-6 rounded-xl bg-white p-4 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Gráfico de
                Producción
              </h2>

              <ProduccionChart
                data={
                  data
                }
              />
            </div>

            <div className="mb-6 rounded-xl bg-white p-4 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Detalle
              </h2>

              <DataTable
                data={
                  data
                }
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
              className="rounded bg-slate-700 px-3 py-1 text-sm"
            >
              Copiar Debug
            </button>
          </div>

          <pre className="max-h-[700px] overflow-auto text-xs">
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
