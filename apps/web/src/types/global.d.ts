/**
 * Ambient/global type declarations for the web app.
 * Feature and component types live alongside their features; this file holds
 * only cross-cutting global augmentations.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly API_BASE_URL: string;
      readonly NEXT_PUBLIC_API_BASE_URL: string;
      readonly NEXT_PUBLIC_APP_NAME: string;
    }
  }
}

export {};
