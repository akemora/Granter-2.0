export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="ml-3 text-sm text-neutral-600">Loading...</span>
    </div>
  );
}
