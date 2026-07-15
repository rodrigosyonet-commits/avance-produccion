import { NextResponse } from "next/server";

import { EMPRESAS } from "@/lib/empresas";
import { consultarSiNube } from "@/lib/sinube";
import { parseBlob } from "@/lib/blobParser";
import { calcularAvance } from "@/lib/avanceService";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      usuario,
      empresa,
      mes,
    } = body;

    console.log("==========");
    console.log("REQUEST");
    console.log("==========");

    console.log({
      usuario,
      empresa,
      mes,
    });

    const empresaSeleccionada =
      EMPRESAS.find(
        (e) => e.rfc === empresa
      );

    if (!empresaSeleccionada) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Empresa no encontrada",
          empresaRecibida:
            empresa,
          empresasDisponibles:
            EMPRESAS,
        },
        {
          status: 404,
        }
      );
    }

    const consulta = `
DECLARE @mes Long = ${mes};

SELECT
O.folioOrden,
O.cantidad AS [Cantidad a Producir],
SD.cantidad AS [Cantidad Producida],
RATING(
O.estatus;;
En Producción;
Terminada;
Cancelada
) AS Estatus
FROM DbOrdenProduccion AS O

INNER JOIN DbAlmEntrada AS S
ON S.empresa = O.empresa
AND S.sucursal = O.sucursal
AND S.folioOrden = O.folioOrden

LEFT JOIN DbAlmEntradaDet AS SD
ON SD.empresa = S.empresa
AND SD.sucursal = S.sucursal
AND SD.folioAlmEntrada = S.folioAlmEntrada

WHERE O.empresa = @empresa
AND O.sucursal = @sucursal
AND O.mes = @mes
`;

    console.log("==========");
    console.log("EMPRESA");
    console.log("==========");

    console.log(
      empresaSeleccionada
    );

    console.log("==========");
    console.log("CONSULTA SQL");
    console.log("==========");

    console.log(consulta);

    const blob =
      await consultarSiNube(
        usuario,
        empresaSeleccionada.rfc,
        empresaSeleccionada.sucursal,
        consulta
      );

    console.log("==========");
    console.log("RESPUESTA RAW");
    console.log("==========");

    console.log(
      blob.substring(0, 3000)
    );

    if (
      blob.startsWith(
        "<!DOCTYPE"
      ) ||
      blob.startsWith("<html")
    ) {
      return NextResponse.json({
        success: false,
        error:
          "SiNube devolvió HTML",
        url:
          process.env.SINUBE_URL,
        raw:
          blob.substring(0, 3000),
      });
    }

    if (
      blob.startsWith("Error:")
    ) {
      return NextResponse.json({
        success: false,
        error: blob,
      });
    }

    const resultado =
      parseBlob(blob);

    console.log("==========");
    console.log("PARSE");
    console.log("==========");

    console.log(
      resultado
    );

    const avance =
      calcularAvance(
        resultado.registros
      );

    console.log("==========");
    console.log("RESULTADO");
    console.log("==========");

    console.log(
      avance.length
    );

    return NextResponse.json({
      success: true,

      debug: {
        url:
          process.env.SINUBE_URL,
        usuario,
        empresa:
          empresaSeleccionada,
        mes,
      },

      registros:
        avance.length,

      raw:
        blob.substring(0, 1000),

      data: avance,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Error desconocido",

        stack:
          error?.stack,

        env: {
          sinubeUrl:
            process.env.SINUBE_URL
              ? "OK"
              : "NO CONFIGURADA",

          sinubePassword:
            process.env.SINUBE_PASSWORD
              ? "OK"
              : "NO CONFIGURADA",
        },
      },
      {
        status: 500,
      }
    );
  }
}
