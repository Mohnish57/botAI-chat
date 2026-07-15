import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Stack,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useConversations } from '../../state/ConversationsContext';
import { STATUS, hasFeedback } from '../../utils/conversation';
import { formatDate } from '../../utils/format';

/**
 * Left navigation: create a chat, jump between past conversations, and open the
 * feedback dashboard. Completed conversations show a small "done" chip and, if
 * present, their star rating so the history is scannable at a glance.
 */
export default function Sidebar({ onNavigate }) {
  const { conversations, createConversation, deleteConversation } = useConversations();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: activeId } = useParams();

  const handleNew = () => {
    const id = createConversation();
    navigate(`/chat/${id}`);
    onNavigate?.();
  };

  const handleOpen = (id) => {
    navigate(`/chat/${id}`);
    onNavigate?.();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteConversation(id);
    // If we deleted the open conversation, go back to a fresh chat.
    if (id === activeId) navigate('/');
  };

  const onFeedbackView = location.pathname.startsWith('/feedback');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
          }}
        >
          b
        </Box>
        <Typography variant="h6">botAI</Typography>
      </Stack>

      <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleNew} fullWidth>
        New chat
      </Button>

      <ListItemButton
        selected={onFeedbackView}
        onClick={() => {
          navigate('/feedback');
          onNavigate?.();
        }}
        sx={{ borderRadius: 2 }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <InsightsRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Feedback dashboard" />
      </ListItemButton>

      <Divider />

      <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
        Conversations
      </Typography>

      <Box sx={{ flex: 1, overflowY: 'auto', mx: -1 }}>
        {conversations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
            No conversations yet. Start a new chat to begin.
          </Typography>
        ) : (
          <List dense disablePadding>
            {conversations.map((c) => {
              const rating = c.feedback?.rating;
              return (
                <ListItemButton
                  key={c.id}
                  selected={c.id === activeId}
                  onClick={() => handleOpen(c.id)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.25,
                    pr: 1,
                    '&:hover .delete-chat-btn': { opacity: 1 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ChatBubbleOutlineRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={c.title}
                    secondary={formatDate(c.updatedAt)}
                    primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 0.5 }}>
                    {c.status === STATUS.COMPLETED && hasFeedback(c) && rating ? (
                      <Chip
                        size="small"
                        icon={<StarRoundedIcon sx={{ fontSize: 14 }} />}
                        label={rating}
                        color="secondary"
                        variant="outlined"
                        sx={{ height: 20, '& .MuiChip-label': { px: 0.5 } }}
                      />
                    ) : null}
                    <Tooltip title="Delete conversation">
                      <IconButton
                        size="small"
                        aria-label={`Delete conversation ${c.title}`}
                        onClick={(e) => handleDelete(e, c.id)}
                        className="delete-chat-btn"
                        sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity .15s' }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}
