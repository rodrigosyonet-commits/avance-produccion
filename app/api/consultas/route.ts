import { NextResponse } from "next/server";

import { EMPRESAS } from "@/lib/empresas";
import { consultarSiNube } from "@/lib/sinube";
import { parseBlob } from "@/lib/blobParser";
import { calcularAvance } from "@/lib/avanceService";

export async function POST(request: Request) {
  const debug: any = {
    timestamp: new Date().toISOString(),
    pasos: [],
  };

  try {
    debug.pasos.push("1. Inicio");

    const body = await request.json();

    debug.body = body;

    const {
      usuario,
      empresaId,
      mes,
    } = body;

    debug.pasos.push("2. JSON recibido");

    const empresa = EMPRESAS.find(
      (e) => e.id === empresaId
    );

    debug.empresaBuscada =
      empresaId;

    if (!empresa) {
      debug.error =
        "Empresa no encontrada";

      return NextResponse.json(
        {
          success: false,
          debug,
        },
        {
          status: 400,
        }
      );
    }

    debug.pasos.push(
      "3. Empresa encontrada"
    );

    debug.empresa = empresa;

    debug.variablesEntorno = {
      SINUBE_URL:
        process.env.SINUBE_URL,
      SINUBE_PASSWORD:
        process.env
          .SINUBE_PASSWORD
          ? "CONFIGURADO"
          : "NO CONFIGURADO",
    };

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

    debug.pasos.push(
      "4. SQL generado"
    );

    debug.sql = consulta;

    debug.parametrosSiNube = {
      url:
        process.env.SINUBE_URL,
      tipo: "3",
      emp: empresa.rfc,
      suc: empresa.sucursal,
      usu: usuario,
      password:
        process.env
          .SINUBE_PASSWORD
          ? "******"
          : "NO DEFINIDO",
    };

    let blob = "";

    try {
      debug.pasos.push(
        "5. Antes de consultar SiNube"
      );

      blob =
        await consultarSiNube(
          usuario,
          empresa.rfc,
          empresa.sucursal,
          consulta
        );

      debug.pasos.push(
        "6. Respuesta recibida"
      );
    } catch (fetchError: any) {
      debug.pasos.push(
        "ERROR FETCH SINUBE"
      );

      debug.fetchError = {
        message:
          fetchError?.message,
        cause:
          fetchError?.cause,
        stack:
          fetchError?.stack,
        name:
          fetchError?.name,
      };

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

    debug.blobInfo = {
      longitud: blob.length,
      primeros1000:
        blob.substring(
          0,
          1000
        ),
    };

    if (
      blob.startsWith(
        "Error:"
      )
    ) {
      debug.errorSiNube =
        blob;

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

    if (
      blob.startsWith(
        "<!DOCTYPE"
      ) ||
      blob.startsWith(
        "<html"
      )
    ) {
      debug.errorHtml =
        "SiNube devolvió HTML";

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

    debug.pasos.push(
      "7. Parseando blob"
    );

    const parsed =
      parseBlob(blob);

    debug.parse = {
      columnas:
        parsed.columnas,
      totalColumnas:
        parsed.columnas.length,
      totalRegistros:
        parsed.registros.length,
      primerRegistro:
        parsed.registros[0] ??
        null,
    };

    debug.pasos.push(
      "8. Calculando avance"
    );

    const data =
      calcularAvance(
        parsed.registros
      );

    debug.avance = {
      registros:
        data.length,
      primerResultado:
        data[0] ?? null,
    };

    debug.pasos.push(
      "9. Fin correcto"
    );

    return NextResponse.json({
      success: true,
      data,
      debug,
    });
  } catch (error: any) {
    debug.pasos.push(
      "ERROR GENERAL"
    );

    debug.errorGeneral = {
      message:
        error?.message,
      stack:
        error?.stack,
      cause:
        error?.cause,
      name:
        error?.name,
    };

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
