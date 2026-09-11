import { inspections } from "./inspections";
import { SimulateError, SimulatedLatencyMs } from "./inspection-controls";

export async function loadInspections() {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, SimulatedLatencyMs);
  });

  if (SimulateError) {
    throw new Error("No se pudieron cargar las inspecciones. Inténtalo de nuevo.");
  }

  return inspections;
}