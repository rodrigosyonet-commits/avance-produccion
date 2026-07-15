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
      "SINUBE_URL no configurada"
    );
  }

  if (!password) {
    throw new Error(
      "SINUBE_PASSWORD no configurada"
    );
  }

  const form = new URLSearchParams();

  form.append("tipo", "3");
  form.append("emp", empresa);
  form.append("suc", sucursal);
  form.append("usu", usuario);
  form.append("pas", password);
  form.append("cns", consulta);

  const response = await fetch(url, {
    method: "POST",
    body: form,
    cache: "no-store",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
    },
  });

  const texto =
    await response.text();

  console.log(
    "STATUS SINUBE:",
    response.status
  );

  console.log(
    "URL SINUBE:",
    url
  );

  console.log(
    "RESPUESTA SINUBE:"
  );

  console.log(texto);

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${texto}`
    );
  }

  if (
    texto.startsWith(
      "<!DOCTYPE"
    ) ||
    texto.startsWith("<html")
  ) {
    throw new Error(
      "SiNube devolvió HTML en lugar de datos. Verifica URL, usuario o password."
    );
  }

  if (
    texto.startsWith("Error:")
  ) {
    throw new Error(texto);
  }

  return texto;
}
