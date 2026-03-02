export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? `Request failed: ${response.status}`);
  }

  return payload.data as T;
}

