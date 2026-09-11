export default function Loading() {
  return (
    <div className="loading-state" aria-busy="true" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>Cargando inspecciones…</p>
    </div>
  );
}