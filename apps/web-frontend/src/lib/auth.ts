const CSRF_COOKIE = 'csrf_token';

export const getCsrfToken = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const isAuthenticated = () => Boolean(getCsrfToken());
