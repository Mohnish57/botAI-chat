import { describe, it, expect } from 'vitest';
import { toFeedbackRows, aggregateStats, filterAndSortRows } from './feedbackStats';
import { createConversation, createMessage, ROLES, REACTIONS } from './conversation';

/** Helper to build a rated conversation. */
function ratedConversation({ title, rating, comment = '', up = 0, down = 0, submittedAt }) {
  const c = createConversation(submittedAt);
  c.title = title;
  const messages = [];
  for (let i = 0; i < up; i += 1) {
    const m = createMessage(ROLES.ASSISTANT, 'x');
    m.reaction = REACTIONS.UP;
    messages.push(m);
  }
  for (let i = 0; i < down; i += 1) {
    const m = createMessage(ROLES.ASSISTANT, 'y');
    m.reaction = REACTIONS.DOWN;
    messages.push(m);
  }
  c.messages = messages;
  c.feedback = { rating, comment, submittedAt };
  return c;
}

describe('toFeedbackRows', () => {
  it('only includes conversations with feedback', () => {
    const rated = ratedConversation({ title: 'A', rating: 5, submittedAt: 1 });
    const unrated = createConversation(2);
    const rows = toFeedbackRows([rated, unrated]);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('A');
  });

  it('maps reaction counts onto the row', () => {
    const c = ratedConversation({ title: 'B', rating: 4, up: 2, down: 1, submittedAt: 1 });
    const [row] = toFeedbackRows([c]);
    expect(row.thumbsUp).toBe(2);
    expect(row.thumbsDown).toBe(1);
  });
});

describe('aggregateStats', () => {
  it('computes average rating and totals', () => {
    const rows = toFeedbackRows([
      ratedConversation({ title: 'A', rating: 4, up: 1, submittedAt: 1 }),
      ratedConversation({ title: 'B', rating: 2, down: 3, submittedAt: 2 }),
    ]);
    const stats = aggregateStats(rows);
    expect(stats.total).toBe(2);
    expect(stats.averageRating).toBe(3);
    expect(stats.totalUp).toBe(1);
    expect(stats.totalDown).toBe(3);
  });

  it('handles the empty case without dividing by zero', () => {
    const stats = aggregateStats([]);
    expect(stats.averageRating).toBe(0);
    expect(stats.total).toBe(0);
  });
});

describe('filterAndSortRows', () => {
  const rows = toFeedbackRows([
    ratedConversation({ title: 'React question', rating: 5, comment: 'great', submittedAt: 3 }),
    ratedConversation({ title: 'Coffee help', rating: 2, comment: 'meh', submittedAt: 1 }),
    ratedConversation({ title: 'ML basics', rating: 5, comment: 'excellent', submittedAt: 2 }),
  ]);

  it('filters by exact rating', () => {
    const out = filterAndSortRows(rows, { rating: 5 });
    expect(out).toHaveLength(2);
    expect(out.every((r) => r.rating === 5)).toBe(true);
  });

  it('searches title and comment case-insensitively', () => {
    expect(filterAndSortRows(rows, { query: 'coffee' })).toHaveLength(1);
    expect(filterAndSortRows(rows, { query: 'EXCELLENT' })).toHaveLength(1);
  });

  it('sorts by newest, oldest, highest and lowest', () => {
    expect(filterAndSortRows(rows, { sort: 'newest' })[0].title).toBe('React question');
    expect(filterAndSortRows(rows, { sort: 'oldest' })[0].title).toBe('Coffee help');
    expect(filterAndSortRows(rows, { sort: 'lowest' })[0].rating).toBe(2);
    expect(filterAndSortRows(rows, { sort: 'highest' })[0].rating).toBe(5);
  });
});
