
export function calcularAvance(
  registros: any[]
) {

  return registros.map((r) => {

    const planeado =
      Number(r[1]) || 0;

    const producido =
      Number(r[2]) || 0;

    const avance =
      planeado <= 0
      ? 0
      : Number(
          (
            producido /
            planeado
          ) * 100
        ).toFixed(2);

    let estado = "🔴 Sin producir";

    if (
      Number(avance) > 0 &&
      Number(avance) < 100
    ) {
      estado = "🟡 Parcial";
    }

    if (
      Number(avance) === 100
    ) {
      estado = "🟢 Completa";
    }

    if (
      Number(avance) > 100
    ) {
      estado = "🔵 Sobreproducción";
    }

    return {
      folioOrden: r[0],
      cantidadProducir: planeado,
      cantidadProducida: producido,
      avance,
      estado
    };

  });

}
