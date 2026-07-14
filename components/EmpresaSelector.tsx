
export type Empresa = {
  nombre: string;
  rfc: string;
  sucursal: string;
};

type EmpresaSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const empresas: Empresa[] = [
  {
    nombre: "Jugos del Valle",
    rfc: "SCM180807MS9",
    sucursal: "Matriz",
  },
  {
    nombre: "Santa Clara",
    rfc: "SCM180807MS9-1",
    sucursal: "Matriz",
  },
  {
    nombre: "Alpura",
    rfc: "SCM180807MS9-2",
    sucursal: "Matriz",
  },
  {
    nombre: "Boboli",
    rfc: "SCM180807MS9-5",
    sucursal: "Matriz",
  },
  {
    nombre: "Jumex",
    rfc: "SCM180807MS9-6",
    sucursal: "Matriz",
  },
];

export default function EmpresaSelector({
  value,
  onChange,
}: EmpresaSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="empresa"
        className="block text-sm font-medium text-slate-700"
      >
        Empresa
      </label>

      <select
        id="empresa"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccione una empresa</option>

        {empresas.map((empresa) => (
          <option
            key={empresa.rfc}
            value={empresa.rfc}
          >
            {empresa.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

export { empresas };
