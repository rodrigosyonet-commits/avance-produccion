import { NextResponse } from "next/server";

import { EMPRESAS } from "@/lib/empresas";
import { consultarSiNube } from "@/lib/sinube";
import { parseBlob } from "@/lib/blobParser";
import { calcularAvance } from "@/lib/avanceService";

export async function POST(request: Request) {
  const debug: any = {
    fecha: new Date().toISOString(),
    paso: [],
  };

  try {
    debug.paso.push("1. Inicio API");

    const body = await request.json();

    debug.bodyRecibido = body;

    const {
      usuario,
      empresaId,
      mes,
    } = body;

    debug.paso.push("2. Body recibido");

    const empresa = EMPRESAS.find(
      (e) => e.id === empresaId
    );

    if (!empresa) {
      debug.error =
        "Empresa no encontrada";

      return NextResponse.json(
        debug,
        { status: 400 }
      );
    }

    debug.paso.push(
      "3. Empresa localizada"
    );

    debug.empresaSeleccionada = empresa;

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

    debug.paso.push(
      "4. SQL generado"
    );

    debug.sql = consulta;

    debug.parametrosSiNube = {
      url: process.env.SINUBE_URL,
      tipo: "3",
      emp: empresa.rfc,
      suc: empresa.sucursal,
      usu: usuario,
      pas:
        process.env.SINUBE_PASSWORD
          ? "******"
          : "NO DEFINIDO",
    };

    debug.paso.push(
      "5. Antes de llamar SiNube"
    );

    let blob = "";

    try {
      blob = await consultarSiNube(
        usuario,
        empresa.rfc,
        empresa.sucursal,
        consulta
      );
    } catch (sinubeError: any) {
      debug.errorSiNube =
        sinubeError?.message ??
        "Error desconocido";

      debug.paso.push(
        "ERROR AL LLAMAR SINUBE"
      );

      return NextResponse.json(
        debug,
        { status: 500 }
      );
    }

    debug.paso.push(
      "6. Respuesta recibida de SiNube"
    );

    debug.longitudBlob =
      blob?.length ?? 0;

    debug.primeros1000Caracteres =
      blob?.substring(0, 1000);

    if (!blob) {
      debug.error =
        "SiNube devolvió respuesta vacía";

      return NextResponse.json(
        debug,
        { status: 500 }
      );
    }

    if (
      blob.startsWith("Error:")
    ) {
      debug.errorSiNube = blob;

      debug.paso.push(
        "ERROR DEVUELTO POR SINUBE"
      );

      return NextResponse.json(
        debug,
        { status: 500 }
      );
    }

    if (
      blob.startsWith("<!DOCTYPE") ||
      blob.startsWith("<html")
    ) {
      debug.errorHtml =
        "SiNube devolvió HTML";

      return NextResponse.json(
        debug,
        { status: 500 }
      );
    }

    debug.paso.push(
      "7. Parseando Blob"
    );

    let parsed;

    try {
      parsed = parseBlob(blob);

      debug.columnas =
        parsed.columnas;

      debug.totalColumnas =
        parsed.columnas.length;

      debug.totalRegistros =
        parsed.registros.length;

      debug.primerRegistro =
        parsed.registros[0] ?? null;
    } catch (parseError: any) {
      debug.errorParsing =
        parseError.message;

      return NextResponse.json(
        debug,
        { status: 500 }
      );
    }

    debug.paso.push(
      "8. Calculando Avance"
    );

    let data = [];

    try {
      data = calcularAvance(
        parsed.registros
      );

      debug.registrosProcesados =
        data.length;

      debug.primerResultado =
        data[0] ?? null;
    } catch (avanceError: any) {
      debug.errorAvance =
        avanceError.message;

      return NextResponse.json(
        debug,
        { status: 500 }
      );
    }

    debug.paso.push(
      "9. KPIs"
    );

    const totalOrdenes =
      data.length;

    const totalPlaneado =
      data.reduce(
        (sum: number, item: any) =>
          sum +
          Number(
            item.cantidadProducir || 0
          ),
        0
      );

    const totalProducido =
      data.reduce(
        (sum: number, item: any) =>
          sum +
          Number(
            item.cantidadProducida || 0
          ),
        0
      );

    const avancePromedio =
      data.length > 0
        ? data.reduce(
            (
              sum: number,
              item: any
            ) =>
              sum +
              Number(
                item.avance || 0
              ),
            0
          ) / data.length
        : 0;

    debug.kpis = {
      totalOrdenes,
      totalPlaneado,
      totalProducido,
      avancePromedio,
    };

    debug.paso.push(
      "10. Fin correcto"
    );

    return NextResponse.json({
      success: true,
      data,
      debug,
    });
  } catch (error: any) {
    debug.error =
      error?.message ??
      "Error desconocido";

    debug.stack = error?.stack;

    debug.paso.push(
      "ERROR GENERAL"
    );

    return NextResponse.json(
      {
        success: false,
        debug,
      },
      {
        status: 500,
      }
    );
  }
}
