export const FormSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}:any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-400 mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/50 border border-gray-800/50 rounded-xl text-white focus:outline-none focus:border-[#39FF14]/50 focus:ring-2 focus:ring-[#39FF14]/20 transition-all"
    >
      <option value="">{placeholder}</option>
      {options.map((opt:any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
