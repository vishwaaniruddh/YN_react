// src/config/api.js

export const getAdminBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('yosshitaneha.com')) {
      return 'https://yosshitaneha.com/admin';
    }
  }
  return 'http://localhost/yn/admin';
};

export const getApiBaseUrl = () => {
  return `${getAdminBaseUrl()}/api`;
};

export const ADMIN_BASE_URL = getAdminBaseUrl();
export const API_BASE_URL = getApiBaseUrl();

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${getAdminBaseUrl()}/${cleanPath}`;
};
