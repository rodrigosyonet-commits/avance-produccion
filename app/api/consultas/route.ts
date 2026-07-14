
import { EMPRESAS } from "@/lib/empresas";
import { consultarSiNube } from "@/lib/sinube";
import { parseBlob } from "@/lib/blobParser";
import { calcularAvance } from "@/lib/avanceService";

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const {
    usuario,
    empresaId,
    mes
  } = body;

  const empresa =
    EMPRESAS.find(
      e => e.id === empresaId
    );

  if (!empresa) {
    return Response.json(
      {
        error: "Empresa no encontrada"
      },
      { status: 404 }
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
ON S.empresa=O.empresa
AND S.sucursal=O.sucursal
AND S.folioOrden=O.folioOrden
LEFT JOIN DbAlmEntradaDet AS SD
ON SD.empresa=S.empresa
AND SD.sucursal=S.sucursal
AND SD.folioAlmEntrada=S.folioAlmEntrada
WHERE O.empresa=@empresa
AND O.sucursal=@sucursal
AND O.mes=@mes
`;

  const blob =
    await consultarSiNube(
      usuario,
      empresa.rfc,
      empresa.sucursal,
      consulta
    );

  const resultado =
    parseBlob(blob);

  const avance =
    calcularAvance(
      resultado.registros
    );

  return Response.json(
    avance
  );
}
