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

    const {
      usuario,
      empresaId,
      mes,
    } = body;

    debug.body = body;

    debug.pasos.push(
      "2. Parametros recibidos"
    );

    const empresa = EMPRESAS.find(
      (e) => e.id === empresaId
    );

    if (!empresa) {
      return NextResponse.json(
        {
          success: false,
          error: "Empresa no encontrada",
          debug,
        },
        {
          status: 400,
        }
      );
    }

    debug.empresa = empresa;

    debug.pasos.push(
      "3. Empresa encontrada"
    );

    const consulta =
      "SELECT " +
      "O.folioOrden," +
      "O.cantidad AS [Cantidad a Producir]," +
      "SD.cantidad AS [Cantidad Producida]," +
      "RATING(O.estatus;;En Producción;Terminada;Cancelada) AS Estatus " +
      "FROM DbOrdenProduccion AS O " +
      "INNER JOIN DbAlmEntrada AS S " +
      "ON S.empresa=O.empresa " +
      "AND S.sucursal=O.sucursal " +
      "AND S.folioOrden=O.folioOrden " +
      "LEFT JOIN DbAlmEntradaDet AS SD " +
      "ON SD.empresa=S.empresa " +
      "AND SD.sucursal=S.sucursal " +
      "AND SD.folioAlmEntrada=S.folioAlmEntrada " +
      "WHERE O.empresa=@empresa " +
      "AND O.sucursal=@sucursal " +
      "AND O.mes=" +
      mes +
      " " +
      "TAMPAG 1000";

    debug.sqlGenerado = consulta;

    debug.parametrosSiNube = {
      url: process.env.SINUBE_URL,
      emp: empresa.rfc,
      suc: empresa.sucursal,
      usu: usuario,
      mes,
      password:
        process.env.SINUBE_PASSWORD
          ? "CONFIGURADO"
          : "NO CONFIGURADO",
    };

    debug.pasos.push(
      "4. Ejecutando consulta SiNube"
    );

    const blob =
      await consultarSiNube(
        usuario,
        empresa.rfc,
        empresa.sucursal,
        consulta
      );

    debug.pasos.push(
      "5. Respuesta SiNube recibida"
    );

    debug.blobPreview =
      blob.substring(0, 1000);

    debug.blobLength =
      blob.length;

    if (!blob) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Respuesta vacía de SiNube",
          debug,
        },
        {
          status: 500,
        }
      );
    }

    if (
      blob.startsWith("Error:")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: blob,
          debug,
        },
        {
          status: 500,
        }
      );
    }

    debug.pasos.push(
      "6. Parseando Blob"
    );

    const parsed =
      parseBlob(blob);

    debug.columnas =
      parsed.columnas;

    debug.totalRegistros =
      parsed.registros.length;

    debug.primerRegistro =
      parsed.registros[0] ?? null;

    debug.pasos.push(
      "7. Calculando Avance"
    );

    const data =
      calcularAvance(
        parsed.registros
      );

    debug.resultados =
      data.length;

    debug.primerResultado =
      data[0] ?? null;

    debug.pasos.push(
      "8. Fin correcto"
    );

    return NextResponse.json({
      success: true,
      data,
      debug,
    });
  } catch (error: any) {
    debug.error = {
      message:
        error?.message ||
        "Error desconocido",
      stack: error?.stack,
      cause: error?.cause,
    };

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Error desconocido",
        debug,
      },
      {
        status: 500,
      }
    );
  }
}
