"use client";

import { useState } from "react";
import EmpresaSelector from "@/components/EmpresaSelector";
import DataTable from "@/components/DataTable";

export default function Home() {
  const [usuario, setUsuario] = useState(
    "sistemas1.qsitservices@gmail.com"
  );

  const [empresa, setEmpresa] = useState(
    "SCM180807MS9"
  );

  const [mes, setMes] = useState("202607");

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
            empresaId: empresa,
            mes,
          }),
        }
      );

      const json =
        await response.json();

      setData(json);
    } catch (error) {
      console.error(error);
      alert(
        "Error al consultar SiNube"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">
        Avance de Producción
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Usuario
          </label>

          <input
            className="w-full rounded-lg border p-2"
            value={usuario}
            onChange={(e) =>
              setUsuario(
                e.target.value
              )
            }
          />
        </div>

        <EmpresaSelector
          value={empresa}
          onChange={setEmpresa}
        />

        <div>
          <label className="mb-1 block text-sm font-medium">
            Mes
          </label>

          <input
            type="month"
            className="w-full rounded-lg border p-2"
            value={`${mes.substring(
              0,
              4
            )}-${mes.substring(
              4,
              6
            )}`}
            onChange={(e) => {
              const valor =
                e.target.value.replace(
                  "-",
                  ""
                );

              setMes(valor);
            }}
          />
        </div>
      </div>

      <button
        onClick={consultar}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
      >
        {loading
          ? "Consultando..."
          : "Consultar"}
      </button>

      <DataTable data={data} />
    </main>
  );
}
