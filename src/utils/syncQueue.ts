// src/utils/syncQueue.ts

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Tiempos de reintento con backoff: 1min → 2min → 4min
const RETRY_DELAYS_MS = [60_000, 120_000, 240_000];

let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryAttempt = 0;

/**
 * Envía la cola offline al backend con reintentos automáticos.
 * Reemplaza el uploadOfflineQueueToServer() simulado de storage.ts
 */
export async function syncQueueToBackend(
  changes: Array<{ id: string; type: string; timestamp: string; payload: unknown }>,
  onSuccess: () => void,
  onError?: (err: string) => void
): Promise<void> {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/sync/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Sync OK: ${data.processed} cambios enviados`, data.errors?.length ? data.errors : '');

    retryAttempt = 0;
    onSuccess();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de red';
    console.warn(`⚠️ Sync falló (intento ${retryAttempt + 1}): ${msg}`);

    if (retryAttempt < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[retryAttempt];
      retryAttempt++;
      console.log(`🔄 Reintentando en ${delay / 60_000} min...`);
      retryTimer = setTimeout(() => syncQueueToBackend(changes, onSuccess, onError), delay);
    } else {
      retryAttempt = 0;
      onError?.(msg);
    }
  }
}

/**
 * Consulta el estado del backend
 */
export async function getBackendStatus(): Promise<{
  online: boolean;
  torneos?: number;
  partidos?: number;
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { online: false };
    const status = await fetch(`${BACKEND_URL}/sync/status`);
    const data = await status.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}