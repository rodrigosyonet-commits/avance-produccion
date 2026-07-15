export async function consultarSiNube(
  usuario: string,
  empresa: string,
  sucursal: string,
  consulta: string
) {
  const url =
    process.env.SINUBE_URL;

  const password =
    process.env.SINUBE_PASSWORD;

  if (!url) {
    throw new Error(
      "SINUBE_URL no configurada"
    );
  }

  if (!password) {
    throw new Error(
      "SINUBE_PASSWORD no configurada"
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
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: form,
      cache: "no-store",
    });

  const texto =
    await response.text();

  return texto;
}
