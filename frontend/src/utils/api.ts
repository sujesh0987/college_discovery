const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

let accessToken: string | null = localStorage.getItem('access_token');

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

export const getAccessToken = () => accessToken;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export const apiFetch = async (path: string, options: RequestOptions = {}) => {
  const url = new URL(`${BASE_URL}${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include' // Send cookie with all requests
  };

  let response = await fetch(url.toString(), fetchOptions);

  // Auto Refresh Token if expired
  if (response.status === 401 && path !== '/auth/login' && path !== '/auth/signup' && path !== '/auth/refresh') {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.data.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
          fetchOptions.headers = headers;
          
          // Retry the original query
          response = await fetch(url.toString(), fetchOptions);
        } else {
          setAccessToken(null);
        }
      } else {
        setAccessToken(null);
      }
    } catch (e) {
      console.error('Failed to auto-refresh access token:', e);
      setAccessToken(null);
    }
  }

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || 'Something went wrong');
  }
  return json;
};
