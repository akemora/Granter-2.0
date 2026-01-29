export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="ml-3 text-sm text-slate-400">Cargando...</span>
    </div>
  );
}
