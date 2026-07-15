import { Box, Paper, Rating, Stack, Typography, Chip } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import { countReactions } from '../../utils/conversation';
import { formatDateTime } from '../../utils/format';

/**
 * Read-only summary of the feedback captured for a completed conversation.
 * Rendered at the top of a past conversation so the reviewer can see the rating,
 * comment and per-message reaction counts at a glance.
 */
export default function FeedbackSummary({ conversation }) {
  const { feedback } = conversation;
  const { up, down } = countReactions(conversation);

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 3, bgcolor: (t) => (t.palette.mode === 'dark' ? '#1c2030' : '#f3f1fd') }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Conversation feedback
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating
              value={feedback?.rating ?? 0}
              readOnly
              icon={<StarRoundedIcon fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary">
              {feedback?.rating ? `${feedback.rating}/5` : 'No rating'}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Chip size="small" icon={<ThumbUpAltRoundedIcon />} label={up} color="success" variant="outlined" />
          <Chip size="small" icon={<ThumbDownAltRoundedIcon />} label={down} color="error" variant="outlined" />
        </Stack>
      </Stack>

      {feedback?.comment ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            “{feedback.comment}”
          </Typography>
        </Box>
      ) : null}

      {feedback?.submittedAt ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Submitted {formatDateTime(feedback.submittedAt)}
        </Typography>
      ) : null}
    </Paper>
  );
}
