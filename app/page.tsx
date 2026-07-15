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

  const [mes, setMes] = useState("202607");

  const [data, setData] = useState<any[]>([]);

  const [debug, setDebug] = useState<any>(null);

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

      setDebug({
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

      const resultado =
        await response.json();

      setDebug({
        enviando: payload,
        status: response.status,
        recibido: resultado,
      });

      if (!response.ok) {
        throw new Error(
          resultado.error ||
            "Error en API"
        );
      }

      if (
        Array.isArray(resultado)
      ) {
        setData(resultado);
      } else if (
        Array.isArray(
          resultado.data
        )
      ) {
        setData(
          resultado.data
        );
      } else {
        setData([]);
      }
    } catch (error: any) {
      console.error(error);

      setDebug((prev: any) => ({
        ...prev,
        error:
          error?.message ||
          String(error),
      }));

      alert(
        error?.message ||
          "Error al consultar SiNube"
      );
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

        <p className="text-slate-500">
          Consulta Productiva
          SiNube
        </p>
      </div>

      <div className="border rounded-xl p-6 bg-white shadow">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
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
              className="w-full border rounded-lg p-2"
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
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {loading
            ? "Consultando..."
            : "Consultar"}
        </button>
      </div>

      {/* DEBUG */}

      <div className="border rounded-xl bg-black text-green-400 p-4">
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

      {/* GRAFICA */}

      {data.length > 0 && (
        <ProduccionChart
          data={data}
        />
      )}

      {/* TABLA */}

      {data.length > 0 && (
        <div className="border rounded-xl bg-white p-4">
          <h2 className="font-semibold mb-4">
            Datos
          </h2>

          <DataTable
            data={data}
          />
        </div>
      )}

      {/* VACIO */}

      {!loading &&
        data.length === 0 && (
          <div className="border border-dashed rounded-xl p-8 text-center text-slate-500">
            Sin resultados
          </div>
        )}
    </main>
  );
}
