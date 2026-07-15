import { useState } from 'react';
import { Box, IconButton, Paper, TextField, Tooltip } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

/**
 * Message composer.
 *
 * - Enter sends, Shift+Enter inserts a newline.
 * - Trims empty input and disables while the assistant is responding.
 *
 * @param {(text: string) => void} onSend
 * @param {boolean} [disabled]
 */
export default function ChatInput({ onSend, disabled = false }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        borderRadius: 4,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message botAI…"
        variant="standard"
        fullWidth
        multiline
        maxRows={6}
        disabled={disabled}
        InputProps={{ disableUnderline: true, sx: { px: 1.5, py: 0.5 } }}
        inputProps={{ 'aria-label': 'Message input' }}
      />
      <Box>
        <Tooltip title="Send (Enter)">
          <span>
            <IconButton
              color="primary"
              onClick={submit}
              disabled={disabled || !value.trim()}
              aria-label="Send message"
            >
              <SendRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}
