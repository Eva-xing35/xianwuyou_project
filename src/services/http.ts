const TOKEN_STORAGE_KEY = 'blindbox_token';

const DEFAULT_BASE_URL = '/api/v1';

const baseUrl = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!raw) return DEFAULT_BASE_URL;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
})();

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody> {
  body?: TBody;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

function buildUrl(path: string, query?: RequestOptions<unknown>['query']): string {
  const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.pathname + url.search;
}

export async function httpRequest<TResponse, TBody = unknown>(
  method: HttpMethod,
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { body, auth = true, query, headers } = options;
  const url = buildUrl(path, query);

  const requestHeaders = new Headers({ 'Content-Type': 'application/json', ...headers });
  if (auth) {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload: ApiResponse<TResponse> | undefined = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = payload?.msg ?? response.statusText;
    throw new Error(message || 'Request failed');
  }

  if (!payload) throw new Error('Empty response from server');
  if (payload.code !== 0) {
    throw new Error(payload.msg ?? 'Server returned an error');
  }

  return payload.data;
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export { TOKEN_STORAGE_KEY };
