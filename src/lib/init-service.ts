/**
 * Single reusable initialization service interface.
 * No backend connection yet — the default implementation is a local stub.
 */

export type InitializationStatus = {
  /** Whether the system has already been initialized (OWNER exists, etc.). */
  initialized: boolean;
  /** Optional details for diagnostics / future backend payloads. */
  details?: Record<string, unknown>;
};

export type InitializationPayload = {
  [key: string]: unknown;
};

export interface InitializationService {
  /** Unique name of the implementation (e.g. "local-stub", "cloud"). */
  readonly name: string;
  /** Reads current initialization status. */
  checkInitialization(signal?: AbortSignal): Promise<InitializationStatus>;
  /** Performs the initialization. Not implemented until backend is connected. */
  initialize(payload?: InitializationPayload, signal?: AbortSignal): Promise<InitializationStatus>;
}

export class InitializationNotImplementedError extends Error {
  constructor(action: string) {
    super(`سرویس راه‌اندازی هنوز به بک‌اند متصل نشده است (${action}).`);
    this.name = "InitializationNotImplementedError";
  }
}

/** Default no-backend implementation: always reports "not initialized". */
export const localStubInitializationService: InitializationService = {
  name: "local-stub",
  async checkInitialization() {
    return { initialized: false, details: { source: "local-stub" } };
  },
  async initialize() {
    throw new InitializationNotImplementedError("initialize");
  },
};

let currentService: InitializationService = localStubInitializationService;

/** Swap the implementation later (e.g. a backend-backed service). */
export function setInitializationService(service: InitializationService) {
  currentService = service;
}

export function getInitializationService(): InitializationService {
  return currentService;
}
