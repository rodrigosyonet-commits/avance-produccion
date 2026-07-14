"use client";

import { useState } from "react";

import EmpresaSelector from "@/components/EmpresaSelector";
import MesSelector from "@/components/MesSelector";
import DataTable from "@/components/DataTable";
import ProduccionChart from "@/components/ProduccionChart";

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
  const [loading, setLoading] =
    useState(false);

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

      if (!response.ok) {
        throw new Error(
          "Error al consultar la API"
        );
      }

      const json =
        await response.json();

      setData(
        Array.isArray(json)
          ? json
          : json.data || []
      );
    } catch (error) {
      console.error(error);

      alert(
        "Ocurrió un error al consultar SiNube."
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Avance de Producción
        </h1>

        <p className="mt-1 text-slate-500">
          Consulta de producción por
          empresa conectada a SiNube.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
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
              className="w-full rounded-lg border border-slate-300 p-2"
              placeholder="Usuario SiNube"
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

        <div className="mt-6">
          <button
            onClick={consultar}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading
              ? "Consultando..."
              : "Consultar"}
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <>
          <ProduccionChart
            data={data}
          />

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Detalle de Producción
            </h2>

            <DataTable data={data} />
          </div>
        </>
      )}

      {!loading &&
        data.length === 0 && (
          <div className="rounded-xl border border-dashed bg-slate-50 p-10 text-center text-slate-500">
            Selecciona una empresa,
            un mes y presiona
            <strong>
              {" "}
              Consultar
            </strong>{" "}
            para obtener información
            desde SiNube.
          </div>
        )}
    </main>
  );
}
