import { Zap } from "lucide-react";

export const CompilationModal = ({
  isCompiling,
  compilationDone,
  compiledPrompt,
  onClose,
}:any) => {
  if (!isCompiling) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f] border-2 border-gray-800/50 rounded-2xl p-8 max-w-md w-full mx-4">
        {!compilationDone ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-gray-800 border-t-[#39FF14] rounded-full animate-spin"></div>
              <Zap className="w-8 h-8 text-[#39FF14] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Compiling Workflow
              </h3>
              <p className="text-gray-400">
                Processing nodes and generating prompt...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-[#39FF14] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center w-full">
              <h3 className="text-2xl font-bold text-white mb-2">
                Compilation Complete!
              </h3>
              <p className="text-gray-400 mb-4">
                Workflow compiled successfully.
              </p>
              <div className="bg-black/50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto border border-gray-800/50">
                <pre className="text-xs text-left text-gray-300 whitespace-pre-wrap font-mono">
                  {compiledPrompt}
                </pre>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#2de00f] transition-all duration-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
