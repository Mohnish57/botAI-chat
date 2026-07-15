import { Avatar, Box, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbUpOffAltRoundedIcon from '@mui/icons-material/ThumbUpOffAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import ThumbDownOffAltRoundedIcon from '@mui/icons-material/ThumbDownOffAltRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MessageContent from './MessageContent';
import { REACTIONS, ROLES } from '../../utils/conversation';
import { formatTime } from '../../utils/format';

/**
 * A single chat message.
 *
 * For assistant messages, thumbs up/down controls are hidden by default and
 * fade in on hover (per the brief). They stay visible if the user has already
 * reacted, and while read-only (a completed conversation) they show the chosen
 * reaction but are disabled.
 *
 * @param {object}   message
 * @param {(reaction: 'up'|'down') => void} [onReact]
 * @param {boolean}  [readOnly] - disable reacting (viewing a past conversation)
 */
export default function MessageBubble({ message, onReact, readOnly = false }) {
  const isUser = message.role === ROLES.USER;
  const reacted = message.reaction != null;

  const reactionControls = !isUser && (
    <Stack
      direction="row"
      spacing={0.5}
      className="reaction-bar"
      sx={{
        mt: 0.5,
        // Hidden until hover; revealed if already reacted so the choice stays visible.
        opacity: reacted ? 1 : 0,
        transition: 'opacity .15s ease',
        pointerEvents: readOnly ? 'none' : 'auto',
      }}
    >
      <Tooltip title="Good response">
        <span>
          <IconButton
            size="small"
            aria-label="Thumbs up"
            aria-pressed={message.reaction === REACTIONS.UP}
            disabled={readOnly}
            onClick={() => onReact?.(REACTIONS.UP)}
            color={message.reaction === REACTIONS.UP ? 'success' : 'default'}
          >
            {message.reaction === REACTIONS.UP ? (
              <ThumbUpAltRoundedIcon fontSize="small" />
            ) : (
              <ThumbUpOffAltRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Bad response">
        <span>
          <IconButton
            size="small"
            aria-label="Thumbs down"
            aria-pressed={message.reaction === REACTIONS.DOWN}
            disabled={readOnly}
            onClick={() => onReact?.(REACTIONS.DOWN)}
            color={message.reaction === REACTIONS.DOWN ? 'error' : 'default'}
          >
            {message.reaction === REACTIONS.DOWN ? (
              <ThumbDownAltRoundedIcon fontSize="small" />
            ) : (
              <ThumbDownOffAltRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        // Reveal reaction controls when hovering anywhere over the row.
        '&:hover .reaction-bar': { opacity: 1 },
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 34,
          height: 34,
          mt: 0.5,
        }}
      >
        {isUser ? <PersonRoundedIcon fontSize="small" /> : <SmartToyRoundedIcon fontSize="small" />}
      </Avatar>

      <Box sx={{ maxWidth: '78%', minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderTopRightRadius: isUser ? 4 : 24,
            borderTopLeftRadius: isUser ? 24 : 4,
          }}
        >
          <MessageContent text={message.content} />
        </Paper>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={isUser ? 'flex-end' : 'space-between'}
          sx={{ mt: 0.25, px: 0.5, color: 'text.secondary', fontSize: 12 }}
        >
          {!isUser && reactionControls}
          <Box component="span" sx={{ fontSize: 11 }}>
            {formatTime(message.createdAt)}
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
