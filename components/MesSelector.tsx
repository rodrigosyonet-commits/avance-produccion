type MesSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MesSelector({
  value,
  onChange,
}: MesSelectorProps) {
  const valorInput =
    value.length === 6
      ? `${value.substring(0, 4)}-${value.substring(4, 6)}`
      : "";

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Mes
      </label>

      <input
        type="month"
        value={valorInput}
        onChange={(e) => {
          const mes = e.target.value.replace("-", "");
          onChange(mes);
        }}
        className="w-full rounded-lg border border-slate-300 bg-white p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
