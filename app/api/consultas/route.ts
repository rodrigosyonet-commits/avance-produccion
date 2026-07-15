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

    const empresaSeleccionada =
      EMPRESAS.find(
        (e) =>
          e.rfc === empresa
      );

    if (
      !empresaSeleccionada
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Empresa no encontrada",
          empresa,
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
WHERE O.empresa=@empresa
AND O.sucursal=@sucursal
AND O.mes=@mes
`;

    const raw =
      await consultarSiNube(
        usuario,
        empresaSeleccionada.rfc,
        empresaSeleccionada.sucursal,
        consulta
      );

    if (
      raw.startsWith(
        "<!DOCTYPE"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "SiNube devolvió HTML",
          raw:
            raw.substring(
              0,
              2000
            ),
        },
        {
          status: 500,
        }
      );
    }

    if (
      raw.startsWith(
        "Error:"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: raw,
        },
        {
          status: 500,
        }
      );
    }

    const resultado =
      parseBlob(raw);

    const avance =
      calcularAvance(
        resultado.registros
      );

    return NextResponse.json({
      success: true,
      data: avance,
      registros:
        avance.length,
      debug: {
        usuario,
        empresa:
          empresaSeleccionada.nombre,
        rfc:
          empresaSeleccionada.rfc,
        mes,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message,
        stack:
          error?.stack,
      },
      {
        status: 500,
      }
    );
  }
}
