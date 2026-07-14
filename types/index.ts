export type Empresa = {
  nombre: string;
  rfc: string;
  sucursal: string;
};

export type ProduccionRow = {
  folioOrden: string;
  "Cantidad a Producir": number;
  "Cantidad Producida": number;
  "% Avance": number;
  Estado: string;
};
