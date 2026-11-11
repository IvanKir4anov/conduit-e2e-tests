const baseUrl = (process.env.BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export const env = {
  baseUrl,
  apiUrl: (process.env.API_URL ?? `${baseUrl}/api`).replace(/\/$/, ''),
} as const;
