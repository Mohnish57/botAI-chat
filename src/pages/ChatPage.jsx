import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatInput from '../components/chat/ChatInput';
import EmptyState from '../components/chat/EmptyState';
import EndConversationDialog from '../components/chat/EndConversationDialog';
import FeedbackSummary from '../components/feedback/FeedbackSummary';
import { useConversation, useConversations } from '../state/ConversationsContext';
import { getAiResponse } from '../utils/mockAi';
import { STATUS, ROLES, hasFeedback } from '../utils/conversation';

/**
 * The chat screen. Handles the full conversation lifecycle:
 *  - sending a message (creating the conversation on first send),
 *  - the mock AI "typing" then responding,
 *  - per-message thumbs reactions (live),
 *  - ending the conversation with a rating + comment (locks it read-only).
 */
export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conversation = useConversation(id);
  const {
    createConversation,
    addUserMessage,
    addAssistantMessage,
    setReaction,
    setFeedback,
    completeConversation,
  } = useConversations();

  const [isTyping, setIsTyping] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef(null);

  const isCompleted = conversation?.status === STATUS.COMPLETED;
  const messages = conversation?.messages ?? [];

  // Keep the latest message in view. Guarded because not every environment
  // (e.g. jsdom in tests) implements Element.scrollTo.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, isTyping]);

  const handleSend = async (text) => {
    // Create the conversation lazily on the first message.
    let conversationId = id;
    if (!conversationId) {
      conversationId = createConversation();
      navigate(`/chat/${conversationId}`, { replace: true });
    }

    addUserMessage(conversationId, text);
    setIsTyping(true);
    try {
      const response = await getAiResponse(text);
      addAssistantMessage(conversationId, response);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReact = (messageId, reaction) => {
    setReaction(id, messageId, reaction);
  };

  const handleSubmitFeedback = ({ rating, comment }) => {
    setFeedback(id, { rating, comment });
    completeConversation(id);
    setDialogOpen(false);
  };

  // A fresh, empty chat — show the welcome/suggestions state.
  if (!conversation || messages.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <EmptyState onPick={handleSend} />
        </Box>
        <Composer onSend={handleSend} disabled={isTyping} />
      </Box>
    );
  }

  const canEndConversation = !isCompleted && messages.some((m) => m.role === ROLES.ASSISTANT);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header row with title + end/feedback actions */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Container maxWidth="md" disableGutters>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {conversation.title}
            </Typography>
            {isCompleted ? (
              <>
                <Chip
                  size="small"
                  icon={<CheckCircleRoundedIcon />}
                  label="Completed"
                  color="success"
                  variant="outlined"
                />
                <Button
                  size="small"
                  startIcon={<EditRoundedIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  Edit feedback
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<RateReviewRoundedIcon />}
                onClick={() => setDialogOpen(true)}
                disabled={!canEndConversation}
              >
                End & rate
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Scrollable message area */}
      <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2 }}>
        <Container maxWidth="md" disableGutters>
          <Stack spacing={2}>
            {isCompleted && hasFeedback(conversation) ? (
              <FeedbackSummary conversation={conversation} />
            ) : null}

            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                readOnly={isCompleted}
                onReact={(reaction) => handleReact(m.id, reaction)}
              />
            ))}

            {isTyping ? <TypingIndicator /> : null}
          </Stack>
        </Container>
      </Box>

      {/* Composer (hidden once the conversation is completed/read-only) */}
      {isCompleted ? (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          <Container maxWidth="md" disableGutters>
            <Typography variant="body2" color="text.secondary" align="center">
              This conversation has ended. Start a new chat to keep talking.
            </Typography>
          </Container>
        </Box>
      ) : (
        <Composer onSend={handleSend} disabled={isTyping} />
      )}

      <EndConversationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitFeedback}
        initial={conversation.feedback}
      />
    </Box>
  );
}

/** Composer wrapper that keeps the input centred and width-constrained. */
function Composer({ onSend, disabled }) {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
      <Container maxWidth="md" disableGutters>
        <ChatInput onSend={onSend} disabled={disabled} />
      </Container>
    </Box>
  );
}
