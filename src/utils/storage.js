/**
 * Thin, safe wrapper around localStorage.
 *
 * All persistence goes through here so the rest of the app never touches
 * localStorage directly — that keeps components testable and means we could
 * swap in a different backend (IndexedDB, an API) by changing this one file.
 */

const STORAGE_KEY = 'botai.conversations.v1';

/** Read and parse the persisted conversations. Returns [] on any error. */
export function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // Corrupt data or storage disabled — fail soft with an empty list.
    console.warn('Failed to load conversations from storage:', err);
    return [];
  }
}

/** Serialise and persist the conversations array. */
export function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.warn('Failed to save conversations to storage:', err);
  }
}

export { STORAGE_KEY };
