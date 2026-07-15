"use client";

import { useState } from "react";

import EmpresaSelector from "@/components/EmpresaSelector";
import MesSelector from "@/components/MesSelector";
import ProduccionChart from "@/components/ProduccionChart";
import DataTable from "@/components/DataTable";

export default function Home() {
  const [usuario, setUsuario] = useState(
    "sistemas1.qsitservices@gmail.com"
  );

  const [empresa, setEmpresa] =
    useState("SCM180807MS9");

  const [mes, setMes] =
    useState("202607");

  const [data, setData] =
    useState<any[]>([]);

  const [debug, setDebug] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  async function consultar() {
    setLoading(true);

    try {
      const payload = {
        usuario,
        empresa,
        mes,
      };

      const response = await fetch(
        "/api/consultas",
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

      const texto =
        await response.text();

      let resultado: any;

      try {
        resultado =
          JSON.parse(texto);
      } catch {
        resultado = {
          raw: texto,
        };
      }

      setDebug({
        enviando: payload,
        status:
          response.status,
        recibido:
          resultado,
      });

      if (!response.ok) {
        throw new Error(
          resultado?.error ||
            texto
        );
      }

      setData(
        resultado.data || []
      );
    } catch (error: any) {
      setDebug({
        error:
          error?.message,
      });

      setData([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Avance de Producción
      </h1>

      <div className="border rounded-xl bg-white p-6">
        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <label>
              Usuario
            </label>

            <input
              value={usuario}
              onChange={(e) =>
                setUsuario(
                  e.target.value
                )
              }
              className="w-full border rounded p-2"
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

        <button
          onClick={consultar}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Consultando..."
            : "Consultar"}
        </button>
      </div>

      <div className="bg-black text-green-400 rounded-xl p-4">
        <h2 className="font-bold mb-2">
          Debug Consulta
        </h2>

        <pre className="text-xs overflow-auto">
          {JSON.stringify(
            debug,
            null,
            2
          )}
        </pre>
      </div>

      {data.length > 0 && (
        <>
          <ProduccionChart
            data={data}
          />

          <DataTable
            data={data}
          />
        </>
      )}
    </main>
  );
}
