export type ClientConfig = {
  /** API base URL including version prefix, e.g. `https://host/api/v1`. */
  baseUrl: string;
  /** Optional headers merged into every request (e.g. `x-user-id` or Bearer token). */
  defaultHeaders?: () => Record<string, string>;
};

let clientConfig: ClientConfig | null = null;

export function configureApiClient(config: ClientConfig): void {
  clientConfig = config;
}

export function getClientConfig(): ClientConfig {
  if (!clientConfig) {
    throw new Error(
      '@finance/client: call configureApiClient({ baseUrl }) before making API requests',
    );
  }
  return clientConfig;
}

/** Lightweight liveness probe — use for warm-up pings (no Mongo check). */
export function apiHealthLiveUrl(): string {
  const { baseUrl } = getClientConfig();
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}/api/health/live`;
}
