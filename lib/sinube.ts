export async function consultarSiNube(
  usuario: string,
  empresa: string,
  sucursal: string,
  consulta: string
) {
  const password =
    process.env.SINUBE_PASSWORD;

  const url =
    process.env.SINUBE_URL;

  if (!password) {
    throw new Error(
      "SINUBE_PASSWORD no configurado"
    );
  }

  if (!url) {
    throw new Error(
      "SINUBE_URL no configurado"
    );
  }

  const form =
    new URLSearchParams();

  form.append("tipo", "3");
  form.append("emp", empresa);
  form.append("suc", sucursal);
  form.append("usu", usuario);
  form.append("pas", password);
  form.append("cns", consulta);

  const response =
    await fetch(url, {
      method: "POST",
      body: form,
      cache: "no-store",
    });

  const text =
    await response.text();

  return text;
}
