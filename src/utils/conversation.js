import { v4 as uuid } from 'uuid';

/**
 * Domain helpers for the conversation data model.
 *
 * A Conversation:
 * {
 *   id, title, status: 'active' | 'completed',
 *   createdAt, updatedAt,
 *   messages: Message[],
 *   feedback: { rating: number, comment: string, submittedAt } | null
 * }
 *
 * A Message:
 * { id, role: 'user' | 'assistant', content, createdAt, reaction: 'up' | 'down' | null }
 *
 * These factory/derive functions are pure so they can be unit tested and reused
 * by the reducer without duplicating shape knowledge.
 */

export const ROLES = { USER: 'user', ASSISTANT: 'assistant' };
export const STATUS = { ACTIVE: 'active', COMPLETED: 'completed' };
export const REACTIONS = { UP: 'up', DOWN: 'down' };

/** Create a fresh, empty conversation. `now` is injectable for deterministic tests. */
export function createConversation(now = Date.now()) {
  return {
    id: uuid(),
    title: 'New chat',
    status: STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
    messages: [],
    feedback: null,
  };
}

/** Create a message. */
export function createMessage(role, content, now = Date.now()) {
  return {
    id: uuid(),
    role,
    content,
    createdAt: now,
    reaction: null,
  };
}

/**
 * Derive a human-friendly title from the first user message.
 * Falls back to "New chat" when there are no user messages yet.
 */
export function deriveTitle(conversation) {
  const firstUser = conversation.messages.find((m) => m.role === ROLES.USER);
  if (!firstUser) return 'New chat';
  const text = firstUser.content.trim().replace(/\s+/g, ' ');
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

/** Count thumbs-up / thumbs-down reactions across a conversation's messages. */
export function countReactions(conversation) {
  return conversation.messages.reduce(
    (acc, m) => {
      if (m.reaction === REACTIONS.UP) acc.up += 1;
      if (m.reaction === REACTIONS.DOWN) acc.down += 1;
      return acc;
    },
    { up: 0, down: 0 }
  );
}

/** A conversation has feedback if it was rated or commented on. */
export function hasFeedback(conversation) {
  return Boolean(conversation.feedback && (conversation.feedback.rating || conversation.feedback.comment));
}
