import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { SUGGESTED_PROMPTS } from '../../utils/mockAi';

/**
 * Shown for a brand-new/empty chat: a friendly intro plus clickable suggested
 * prompts to help the user get started.
 *
 * @param {(prompt: string) => void} onPick
 */
export default function EmptyState({ onPick }) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
        <SmartToyRoundedIcon sx={{ fontSize: 34 }} />
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Chat with botAI
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Ask a question, react to answers, and rate the conversation when you&apos;re done.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap sx={{ mt: 1 }}>
        {SUGGESTED_PROMPTS.map((p) => (
          <Chip
            key={p}
            label={p}
            onClick={() => onPick(p)}
            icon={<AutoAwesomeRoundedIcon />}
            variant="outlined"
            sx={{ cursor: 'pointer', py: 2 }}
          />
        ))}
      </Stack>
    </Box>
  );
}
