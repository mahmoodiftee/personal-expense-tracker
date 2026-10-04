const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1';

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
  appName: process.env.EXPO_PUBLIC_APP_NAME?.trim() || 'Finance',
  demoUserId: process.env.EXPO_PUBLIC_DEMO_USER_ID?.trim() || undefined,
} as const;
