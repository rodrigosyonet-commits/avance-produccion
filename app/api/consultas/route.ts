import { EMPRESAS } from "@/lib/empresas";
import { consultarSiNube } from "@/lib/sinube";
import { parseBlob } from "@/lib/blobParser";
import { calcularAvance } from "@/lib/avanceService";
import { NextResponse } from "next/server";

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
        (e) => e.rfc === empresa
      );

    if (!empresaSeleccionada) {
      return NextResponse.json(
        {
          error:
            "Empresa no encontrada",
          empresaRecibida:
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

WHERE O.empresa = @empresa
AND O.sucursal = @sucursal
AND O.mes = @mes
`;

    const blob =
      await consultarSiNube(
        usuario,
        empresaSeleccionada.rfc,
        empresaSeleccionada.sucursal,
        consulta
      );

    const resultado =
      parseBlob(blob);

    const avance =
      calcularAvance(
        resultado.registros
      );

    return NextResponse.json({
      success: true,
      empresa:
        empresaSeleccionada.nombre,
      registros:
        avance.length,
      data: avance,
      raw: blob.substring(
        0,
        1000
      ),
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
          process.env.NODE_ENV !==
          "production"
            ? error?.stack
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}
