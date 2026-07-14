
export function parseBlob(blob: string) {

  const filas = blob.split("¬");

  const encabezado = filas[0];

  const partes = encabezado.split("|");

  const columnas: string[] = [];

  for (let i = 2; i < partes.length; i += 2) {
    columnas.push(partes[i]);
  }

  const registros: any[] = [];

  for (let i = 1; i < filas.length; i++) {

    if (!filas[i].trim()) continue;

    registros.push(
      filas[i].split("|")
    );
  }

  return {
    columnas,
    registros
  };
}
