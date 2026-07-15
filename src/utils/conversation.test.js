import { describe, it, expect } from 'vitest';
import {
  createConversation,
  createMessage,
  deriveTitle,
  countReactions,
  hasFeedback,
  ROLES,
  REACTIONS,
  STATUS,
} from './conversation';

describe('createConversation', () => {
  it('creates an empty active conversation with an id', () => {
    const c = createConversation(123);
    expect(c.id).toBeTruthy();
    expect(c.status).toBe(STATUS.ACTIVE);
    expect(c.messages).toEqual([]);
    expect(c.feedback).toBeNull();
    expect(c.createdAt).toBe(123);
  });
});

describe('deriveTitle', () => {
  it('uses the first user message', () => {
    const c = createConversation();
    c.messages = [createMessage(ROLES.USER, 'Hello there')];
    expect(deriveTitle(c)).toBe('Hello there');
  });

  it('truncates long titles', () => {
    const c = createConversation();
    c.messages = [createMessage(ROLES.USER, 'a'.repeat(60))];
    expect(deriveTitle(c).endsWith('…')).toBe(true);
    expect(deriveTitle(c).length).toBeLessThanOrEqual(43);
  });

  it('falls back to "New chat" with no user message', () => {
    expect(deriveTitle(createConversation())).toBe('New chat');
  });
});

describe('countReactions', () => {
  it('counts thumbs up and down', () => {
    const c = createConversation();
    const up = createMessage(ROLES.ASSISTANT, 'a');
    up.reaction = REACTIONS.UP;
    const down = createMessage(ROLES.ASSISTANT, 'b');
    down.reaction = REACTIONS.DOWN;
    const none = createMessage(ROLES.ASSISTANT, 'c');
    c.messages = [up, down, none];
    expect(countReactions(c)).toEqual({ up: 1, down: 1 });
  });
});

describe('hasFeedback', () => {
  it('is false without feedback', () => {
    expect(hasFeedback(createConversation())).toBe(false);
  });
  it('is true with a rating', () => {
    const c = createConversation();
    c.feedback = { rating: 3, comment: '' };
    expect(hasFeedback(c)).toBe(true);
  });
  it('is true with only a comment', () => {
    const c = createConversation();
    c.feedback = { rating: null, comment: 'nice' };
    expect(hasFeedback(c)).toBe(true);
  });
});
