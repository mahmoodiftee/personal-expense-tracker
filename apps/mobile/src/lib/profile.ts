/**
 * Profile source for the greeting hero. Returns a static fallback today so
 * the Plum template can ship before auth exists; swap the body for a real
 * session query later without touching the header.
 */
export type Profile = {
  name: string;
  avatarUrl: string | null;
};

const FALLBACK_PROFILE: Profile = {
  name: 'there',
  avatarUrl: null,
};

export function useProfile(): Profile {
  return FALLBACK_PROFILE;
}
