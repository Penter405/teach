// Holds the Google ID token (credential) of the signed-in user so API calls can
// prove who they are. Guests never have a token, so the backend rejects them.
// Google ID tokens are valid for about 1 hour; after that the API returns 401.

const STORAGE_KEY = 'teach_google_id_token';
let memoryToken: string | null = null;

export function setIdToken(token: string | null): void {
  memoryToken = token;
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode etc.) – memory copy is enough
  }
}

export function getIdToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function authHeaders(): Record<string, string> {
  const token = getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const SESSION_EXPIRED_MESSAGE = '登入已過期，請重新整理頁面並重新登入。';
