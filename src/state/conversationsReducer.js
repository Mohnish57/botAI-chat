import {
  createConversation,
  createMessage,
  deriveTitle,
  ROLES,
  STATUS,
} from '../utils/conversation';

/**
 * Pure reducer for the conversations collection.
 *
 * Keeping all state transitions in one pure function means the whole app's
 * behaviour can be unit tested without rendering a single component, and the
 * context provider stays a thin wrapper.
 *
 * State shape: Conversation[]
 */

export const ACTIONS = {
  CREATE: 'CREATE',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_REACTION: 'SET_REACTION',
  SET_FEEDBACK: 'SET_FEEDBACK',
  COMPLETE: 'COMPLETE',
  DELETE: 'DELETE',
  RENAME: 'RENAME',
};

/** Immutably update the conversation with `id` using the `updater` function. */
function updateConversation(state, id, updater, now) {
  return state.map((c) => (c.id === id ? { ...updater(c), updatedAt: now ?? c.updatedAt } : c));
}

export function conversationsReducer(state, action) {
  const now = action.now ?? Date.now();

  switch (action.type) {
    case ACTIONS.CREATE: {
      const conversation = action.conversation ?? createConversation(now);
      return [conversation, ...state];
    }

    case ACTIONS.ADD_MESSAGE: {
      const { conversationId, role, content } = action;
      const message = action.message ?? createMessage(role, content, now);
      return updateConversation(
        state,
        conversationId,
        (c) => {
          const messages = [...c.messages, message];
          const next = { ...c, messages };
          // Auto-title the conversation from its first user message.
          if (c.title === 'New chat') next.title = deriveTitle(next);
          return next;
        },
        now
      );
    }

    case ACTIONS.SET_REACTION: {
      const { conversationId, messageId, reaction } = action;
      return updateConversation(
        state,
        conversationId,
        (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? // Toggle off if the same reaction is clicked again.
                { ...m, reaction: m.reaction === reaction ? null : reaction }
              : m
          ),
        }),
        now
      );
    }

    case ACTIONS.SET_FEEDBACK: {
      const { conversationId, rating, comment } = action;
      return updateConversation(
        state,
        conversationId,
        (c) => ({
          ...c,
          feedback: { rating: rating ?? null, comment: comment ?? '', submittedAt: now },
        }),
        now
      );
    }

    case ACTIONS.COMPLETE: {
      return updateConversation(
        state,
        action.conversationId,
        (c) => ({ ...c, status: STATUS.COMPLETED }),
        now
      );
    }

    case ACTIONS.RENAME: {
      return updateConversation(
        state,
        action.conversationId,
        (c) => ({ ...c, title: action.title || c.title }),
        now
      );
    }

    case ACTIONS.DELETE: {
      return state.filter((c) => c.id !== action.conversationId);
    }

    default:
      return state;
  }
}

export { ROLES, STATUS };
