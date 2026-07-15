import responses from '../data/mockResponses.json';

/**
 * Mock AI engine.
 *
 * The knowledge base ([src/data/mockResponses.json]) is the provided sample data:
 * a flat array of `{ id, question, response }`. Since there are no explicit
 * keywords, matching is done in three increasingly forgiving passes:
 *   1. Exact (case/whitespace-insensitive) match on the question.
 *   2. Substring containment either way (message ⊇ question or question ⊇ message).
 *   3. Token-overlap scoring — pick the question that shares the most meaningful
 *      words with the message, above a small threshold.
 * If nothing is confident enough we return DEFAULT_RESPONSE.
 *
 * Keeping this pure (input string -> output string) makes it trivial to unit test.
 */

/** Fallback used when no scripted answer is confident enough. */
export const DEFAULT_RESPONSE =
  "I'm a mock AI for this demo, so I only have scripted answers to a fixed set of questions. " +
  'Try asking about **RESTful APIs**, **Promises in JavaScript**, the **virtual DOM**, ' +
  '**Docker**, **React hooks**, or **how to improve web app security**.';

// Common words ignored when scoring overlap so matches key off meaningful terms.
const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'you', 'your', 'can', 'how', 'what', 'whats', 'why',
  'is', 'in', 'a', 'an', 'of', 'to', 'do', 'does', 'me', 'my', 'i', 'it', 'its',
  'explain', 'describe', 'tell', 'about', 'with', 'use', 'used', 'would', 'when',
  'concept', 'some',
]);

/** Normalise a string for comparison: lower-cased, trimmed, single-spaced. */
export function normalize(text = '') {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Break text into meaningful lowercase tokens (drops punctuation + stopwords). */
export function tokenize(text = '') {
  return normalize(text)
    .replace(/[^a-z0-9/\s]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Find the best matching scripted response for a message.
 * @param {string} message - the raw user message
 * @returns {string} the AI response text
 */
export function findResponse(message) {
  const normalized = normalize(message);
  if (!normalized) return DEFAULT_RESPONSE;

  // 1. Exact question match.
  const exact = responses.find((r) => normalize(r.question) === normalized);
  if (exact) return exact.response;

  // 2. Substring containment either direction.
  const contained = responses.find((r) => {
    const q = normalize(r.question);
    return q.length > 3 && (normalized.includes(q) || q.includes(normalized));
  });
  if (contained) return contained.response;

  // 3. Token-overlap scoring — most shared meaningful words wins.
  const messageTokens = new Set(tokenize(message));
  let best = null;
  let bestScore = 0;
  for (const r of responses) {
    const qTokens = tokenize(r.question);
    const score = qTokens.reduce((s, t) => s + (messageTokens.has(t) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  if (best && bestScore >= 2) return best.response;

  return DEFAULT_RESPONSE;
}

/**
 * Simulate an async AI call so the UI can show a "typing" state.
 * The small delay makes the mock feel like a real request without slowing tests much.
 * @param {string} message
 * @param {{ delay?: number }} [opts]
 * @returns {Promise<string>}
 */
export function getAiResponse(message, { delay = 700 } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(findResponse(message)), delay);
  });
}

/** Suggested prompts surfaced to the user on an empty chat (drawn from the data set). */
export const SUGGESTED_PROMPTS = [
  'What is a Promise in JavaScript?',
  'What is the virtual DOM?',
  'Can you explain RESTful APIs?',
  'What are hooks in React?',
];
