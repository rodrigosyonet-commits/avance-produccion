
export async function consultarSiNube(
  usuario: string,
  empresa: string,
  sucursal: string,
  consulta: string
) {

  const form = new URLSearchParams();

  form.append("tipo", "3");
  form.append("emp", empresa);
  form.append("suc", sucursal);
  form.append("usu", usuario);
  form.append(
    "pas",
    process.env.SINUBE_PASSWORD!
  );
  form.append("cns", consulta);

  const response = await fetch(
    process.env.SINUBE_URL!,
    {
      method: "POST",
      body: form,
      cache: "no-store"
    }
  );

  return await response.text();
}
