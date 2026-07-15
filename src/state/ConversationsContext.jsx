import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { conversationsReducer, ACTIONS } from './conversationsReducer';
import { loadConversations, saveConversations } from '../utils/storage';
import { createConversation, createMessage, ROLES } from '../utils/conversation';

/**
 * Provides the conversations collection and action helpers to the whole app.
 *
 * - State lives in a pure reducer (`conversationsReducer`).
 * - It's lazily initialised from localStorage and persisted on every change.
 * - Consumers get ergonomic action creators instead of raw dispatch calls.
 */

const ConversationsContext = createContext(null);

export function ConversationsProvider({ children }) {
  const [conversations, dispatch] = useReducer(
    conversationsReducer,
    undefined,
    // Lazy init — read persisted state once on mount.
    () => loadConversations()
  );

  // Persist whenever conversations change.
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Stable action helpers. Some return created ids so callers can navigate.
  const actions = useMemo(
    () => ({
      createConversation() {
        const conversation = createConversation();
        dispatch({ type: ACTIONS.CREATE, conversation });
        return conversation.id;
      },
      addUserMessage(conversationId, content) {
        const message = createMessage(ROLES.USER, content);
        dispatch({ type: ACTIONS.ADD_MESSAGE, conversationId, message });
        return message.id;
      },
      addAssistantMessage(conversationId, content) {
        const message = createMessage(ROLES.ASSISTANT, content);
        dispatch({ type: ACTIONS.ADD_MESSAGE, conversationId, message });
        return message.id;
      },
      setReaction(conversationId, messageId, reaction) {
        dispatch({ type: ACTIONS.SET_REACTION, conversationId, messageId, reaction });
      },
      setFeedback(conversationId, { rating, comment }) {
        dispatch({ type: ACTIONS.SET_FEEDBACK, conversationId, rating, comment });
      },
      completeConversation(conversationId) {
        dispatch({ type: ACTIONS.COMPLETE, conversationId });
      },
      renameConversation(conversationId, title) {
        dispatch({ type: ACTIONS.RENAME, conversationId, title });
      },
      deleteConversation(conversationId) {
        dispatch({ type: ACTIONS.DELETE, conversationId });
      },
    }),
    []
  );

  const value = useMemo(() => ({ conversations, ...actions }), [conversations, actions]);

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

/** Access the conversations state and actions. */
export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error('useConversations must be used within a ConversationsProvider');
  return ctx;
}

/** Convenience selector for a single conversation by id. */
export function useConversation(id) {
  const { conversations } = useConversations();
  return conversations.find((c) => c.id === id) ?? null;
}
