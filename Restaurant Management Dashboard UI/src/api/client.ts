type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (raw && raw.trim().length > 0 ? raw.trim() : "http://127.0.0.1:5000").replace(/\/+$/, "");
}

export async function apiRequest<T>(
  path: string,
  options?: {
    method?: HttpMethod;
    body?: unknown;
    signal?: AbortSignal;
  },
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const method = options?.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  let body: string | undefined;
  if (typeof options?.body !== "undefined") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    signal: options?.signal,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "error" in (payload as any)
        ? String((payload as any).error)
        : `HTTP ${res.status}`;
    throw new Error(message);
  }

  return payload as T;
}
