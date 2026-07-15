import { Paper, Stack, Typography } from '@mui/material';

/** A compact metric tile used in the dashboard header. */
export default function StatCard({ icon, label, value, color = 'text.primary' }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flex: 1, minWidth: 140 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {icon}
        <Stack>
          <Typography variant="h5" fontWeight={700} sx={{ color, lineHeight: 1.1 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
