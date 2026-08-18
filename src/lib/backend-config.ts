/**
 * Backend configuration layer.
 *
 * Single reusable interface for backend connection settings.
 * No backend is connected yet, no credentials are hardcoded, and no secrets are stored here.
 * Implementations can be swapped later (e.g. env-based, connector-based, or admin-configured).
 */

export interface BackendConfig {
  /** Human-readable name of the configuration source (e.g. "env", "local-stub"). */
  readonly source: string;
  /** Base URL of the backend API. Empty string means not configured. */
  readonly backendUrl: string;
  /** Public API key for the backend. Empty string means not configured. */
  readonly publicApiKey: string;
  /** Whether both required values are present. */
  readonly isConfigured: boolean;
}

export interface BackendConfigProvider {
  /** Returns the current backend configuration. */
  getConfig(): BackendConfig;
}

export class BackendConfigMissingError extends Error {
  constructor() {
    super("تنظیمات بک‌اند هنوز پیکربندی نشده است.");
    this.name = "BackendConfigMissingError";
  }
}

/** Default stub: no backend URL or public API key, ready for future configuration sources. */
export const stubBackendConfigProvider: BackendConfigProvider = {
  getConfig() {
    return {
      source: "local-stub",
      backendUrl: "",
      publicApiKey: "",
      isConfigured: false,
    };
  },
};

let currentProvider: BackendConfigProvider = stubBackendConfigProvider;

/** Swap the provider later (e.g. env reader, connector, or admin panel). */
export function setBackendConfigProvider(provider: BackendConfigProvider) {
  currentProvider = provider;
}

export function getBackendConfigProvider(): BackendConfigProvider {
  return currentProvider;
}

export function getBackendConfig(): BackendConfig {
  return getBackendConfigProvider().getConfig();
}
