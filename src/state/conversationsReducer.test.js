import { describe, it, expect } from 'vitest';
import { conversationsReducer, ACTIONS } from './conversationsReducer';
import { createConversation, createMessage, ROLES, REACTIONS, STATUS } from '../utils/conversation';

const NOW = 1_700_000_000_000;

/** Build a state with one conversation containing a user + assistant message. */
function seed() {
  const conv = createConversation(NOW);
  const userMsg = createMessage(ROLES.USER, 'What is React?', NOW);
  const aiMsg = createMessage(ROLES.ASSISTANT, 'React is a library.', NOW);
  conv.messages = [userMsg, aiMsg];
  conv.title = 'What is React?';
  return { state: [conv], conv, userMsg, aiMsg };
}

describe('conversationsReducer', () => {
  it('CREATE prepends a new conversation', () => {
    const first = createConversation(NOW);
    const second = createConversation(NOW + 1);
    let state = conversationsReducer([], { type: ACTIONS.CREATE, conversation: first });
    state = conversationsReducer(state, { type: ACTIONS.CREATE, conversation: second });
    expect(state).toHaveLength(2);
    expect(state[0].id).toBe(second.id); // newest first
  });

  it('ADD_MESSAGE appends and auto-titles from the first user message', () => {
    const conv = createConversation(NOW);
    let state = [conv];
    const message = createMessage(ROLES.USER, 'How do I make coffee?', NOW);
    state = conversationsReducer(state, {
      type: ACTIONS.ADD_MESSAGE,
      conversationId: conv.id,
      message,
      now: NOW + 10,
    });
    expect(state[0].messages).toHaveLength(1);
    expect(state[0].title).toBe('How do I make coffee?');
    expect(state[0].updatedAt).toBe(NOW + 10);
  });

  it('SET_REACTION sets and toggles a reaction off', () => {
    const { state, conv, aiMsg } = seed();
    let next = conversationsReducer(state, {
      type: ACTIONS.SET_REACTION,
      conversationId: conv.id,
      messageId: aiMsg.id,
      reaction: REACTIONS.UP,
    });
    expect(next[0].messages[1].reaction).toBe(REACTIONS.UP);

    // Clicking the same reaction again clears it.
    next = conversationsReducer(next, {
      type: ACTIONS.SET_REACTION,
      conversationId: conv.id,
      messageId: aiMsg.id,
      reaction: REACTIONS.UP,
    });
    expect(next[0].messages[1].reaction).toBeNull();
  });

  it('SET_FEEDBACK stores rating and comment', () => {
    const { state, conv } = seed();
    const next = conversationsReducer(state, {
      type: ACTIONS.SET_FEEDBACK,
      conversationId: conv.id,
      rating: 4,
      comment: 'Helpful!',
      now: NOW,
    });
    expect(next[0].feedback).toEqual({ rating: 4, comment: 'Helpful!', submittedAt: NOW });
  });

  it('COMPLETE marks a conversation completed', () => {
    const { state, conv } = seed();
    const next = conversationsReducer(state, { type: ACTIONS.COMPLETE, conversationId: conv.id });
    expect(next[0].status).toBe(STATUS.COMPLETED);
  });

  it('DELETE removes the conversation', () => {
    const { state, conv } = seed();
    const next = conversationsReducer(state, { type: ACTIONS.DELETE, conversationId: conv.id });
    expect(next).toHaveLength(0);
  });

  it('does not mutate the previous state (immutability)', () => {
    const { state, conv, aiMsg } = seed();
    const next = conversationsReducer(state, {
      type: ACTIONS.SET_REACTION,
      conversationId: conv.id,
      messageId: aiMsg.id,
      reaction: REACTIONS.DOWN,
    });
    expect(state[0].messages[1].reaction).toBeNull(); // original untouched
    expect(next).not.toBe(state);
  });
});
