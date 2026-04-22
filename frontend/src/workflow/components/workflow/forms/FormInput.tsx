export const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-400 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/50 border border-gray-800/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 focus:ring-2 focus:ring-[#39FF14]/20 transition-all"
    />
  </div>
);
