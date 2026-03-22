const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

function buildHeaders(extra = {}) {
  const headers = { ...extra };
  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }
  return headers;
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    cache: 'no-store',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }

  return response.json();
}

export async function apiPost(path, body = null) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: buildHeaders({
      'Content-Type': 'application/json',
    }),
    body: body ? JSON.stringify(body) : null,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || `POST ${path} failed: ${response.status}`);
  }

  return payload;
}

export function getVideoUrl() {
  if (!API_BASE) return '';
  const url = new URL(`${API_BASE}/video`);
  if (API_TOKEN) {
    url.searchParams.set('token', API_TOKEN);
  }
  url.searchParams.set('ts', String(Date.now()));
  return url.toString();
}
