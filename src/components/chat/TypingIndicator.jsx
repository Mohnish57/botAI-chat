import { Avatar, Box, Paper, Stack, keyframes } from '@mui/material';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';

// Three dots bouncing in sequence to signal the AI is "thinking".
const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-4px); opacity: 1; }
`;

/** Shown while the mock AI response is being generated. */
export default function TypingIndicator() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" aria-label="Assistant is typing">
      <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34, mt: 0.5 }}>
        <SmartToyRoundedIcon fontSize="small" />
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 3,
          borderTopLeftRadius: 4,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={0.6}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: 'text.secondary',
                animation: `${bounce} 1.2s infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
