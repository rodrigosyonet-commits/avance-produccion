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
  form.append(
    "suc",
    sucursal
  );
  form.append(
    "usu",
    usuario
  );
  form.append(
    "pas",
    password
  );
  form.append(
    "cns",
    consulta
  );

  console.log(
    "=========="
  );
  console.log(
    "REQUEST SINUBE"
  );
  console.log(
    "=========="
  );

  console.log({
    url,
    usuario,
    empresa,
    sucursal,
  });

  const response =
    await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: form,
    });

  const texto =
    await response.text();

  console.log(
    "STATUS:",
    response.status
  );

  console.log(
    "RESPUESTA:"
  );

  console.log(
    texto.substring(
      0,
      3000
    )
  );

  return texto;
}
