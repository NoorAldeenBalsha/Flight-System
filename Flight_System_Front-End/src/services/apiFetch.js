const API_BASE = 'http://localhost:5000/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/user/refresh-token`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!refreshRes.ok) {
      localStorage.removeItem('accessToken');
      window.location.href = '/auth';
      throw new Error('Session expired');
    }

    const { accessToken } = await refreshRes.json();
    localStorage.setItem('accessToken', accessToken);

    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return res;
}