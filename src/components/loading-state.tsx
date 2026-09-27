/* src/components/loading-state.tsx */
export function LoadingState({ label = "Cargando inspecciones…" }: { label?: string }) {
  return (
    <div className="loading-state" aria-busy="true" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export default LoadingState;