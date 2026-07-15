import { countReactions, hasFeedback } from './conversation';

/**
 * Pure selectors that turn the raw conversations list into the rows and
 * aggregate stats the feedback dashboard renders. Kept separate from the view
 * so they're easy to unit test.
 */

/** Build one dashboard row per conversation that has feedback. */
export function toFeedbackRows(conversations) {
  return conversations
    .filter(hasFeedback)
    .map((c) => {
      const { up, down } = countReactions(c);
      return {
        id: c.id,
        title: c.title,
        rating: c.feedback.rating ?? null,
        comment: c.feedback.comment ?? '',
        thumbsUp: up,
        thumbsDown: down,
        messageCount: c.messages.length,
        submittedAt: c.feedback.submittedAt ?? c.updatedAt,
      };
    });
}

/** Aggregate stats across all feedback rows. */
export function aggregateStats(rows) {
  const rated = rows.filter((r) => typeof r.rating === 'number' && r.rating > 0);
  const total = rows.length;
  const averageRating = rated.length
    ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length
    : 0;
  const totalUp = rows.reduce((s, r) => s + r.thumbsUp, 0);
  const totalDown = rows.reduce((s, r) => s + r.thumbsDown, 0);

  return {
    total,
    averageRating,
    totalUp,
    totalDown,
  };
}

/**
 * Filter + sort rows for display.
 * @param {Array} rows
 * @param {object} opts
 * @param {number|'all'} opts.rating - exact rating to keep, or 'all'
 * @param {string} opts.query - case-insensitive text search over title/comment
 * @param {'newest'|'oldest'|'highest'|'lowest'} opts.sort
 */
export function filterAndSortRows(rows, { rating = 'all', query = '', sort = 'newest' } = {}) {
  const q = query.trim().toLowerCase();

  let out = rows.filter((r) => {
    const matchesRating = rating === 'all' || r.rating === rating;
    const matchesQuery =
      !q || r.title.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    return matchesRating && matchesQuery;
  });

  const sorters = {
    newest: (a, b) => b.submittedAt - a.submittedAt,
    oldest: (a, b) => a.submittedAt - b.submittedAt,
    highest: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    lowest: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
  };

  out = [...out].sort(sorters[sort] ?? sorters.newest);
  return out;
}
