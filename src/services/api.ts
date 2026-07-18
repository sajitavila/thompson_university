import { api } from 'src/boot/axios';

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelizeKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(camelizeKeys);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [toCamelCase(k), camelizeKeys(v)])
    );
  }
  return obj;
}

api.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object') {
    response.data = camelizeKeys(response.data);
  }
  return response;
});

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export { api };
