export async function consultarSiNube(
  usuario: string,
  empresa: string,
  sucursal: string,
  consulta: string
) {
  const url = process.env.SINUBE_URL;

  const password =
    process.env.SINUBE_PASSWORD;

  if (!url) {
    throw new Error(
      "SINUBE_URL no configurado"
    );
  }

  if (!password) {
    throw new Error(
      "SINUBE_PASSWORD no configurado"
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

  try {
    console.log("URL:");
    console.log(url);

    const response =
      await fetch(url, {
        method: "POST",
        body: form,
      });

    console.log(
      "STATUS:",
      response.status
    );

    const text =
      await response.text();

    console.log(
      "RESPUESTA:"
    );

    console.log(
      text.substring(
        0,
        1000
      )
    );

    return text;
  } catch (error: any) {
    console.error(
      "ERROR FETCH SINUBE"
    );

    console.error(error);

    console.error(
      error?.cause
    );

    throw new Error(
      JSON.stringify({
        message:
          error?.message,
        cause:
          error?.cause,
      })
    );
  }
}
