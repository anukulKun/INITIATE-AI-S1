export const FormTextarea = ({ label, value, onChange, placeholder, rows = 4 }:any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-400 mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-black/50 border border-gray-800/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 focus:ring-2 focus:ring-[#39FF14]/20 transition-all resize-none"
    />
  </div>
);
