
"use client";

import { useState } from "react";

export default function Home() {

  const [usuario,setUsuario]
    = useState(
      "sistemas1.qsitservices@gmail.com"
    );

  const [empresa,setEmpresa]
    = useState("jugos");

  const [mes,setMes]
    = useState("202607");

  const [data,setData]
    = useState<any[]>([]);

  async function consultar() {

    const response =
      await fetch(
        "/api/consulta",
        {
          method:"POST",
          headers:{
            "Content-Type":
            "application/json"
          },
          body: JSON.stringify({
            usuario,
            empresaId: empresa,
            mes
          })
        }
      );

    const json =
      await response.json();

    setData(json);

  }

  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Avance de Producción
      </h1>

      <input
        value={usuario}
        onChange={e =>
          setUsuario(e.target.value)
        }
        placeholder="Usuario"
      />

      <button
        onClick={consultar}
      >
        Consultar
      </button>

      <pre>
        {
          JSON.stringify(
            data,
            null,
            2
          )
        }
      </pre>

    </main>
  );

}
