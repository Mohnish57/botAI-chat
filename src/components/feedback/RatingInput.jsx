import { useState } from 'react';
import { Box, Rating, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

// Short labels shown next to the current/hovered star value.
const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

/**
 * A 5-star rating control with a live label.
 *
 * @param {number|null} value
 * @param {(value: number|null) => void} onChange
 * @param {boolean} [readOnly]
 */
export default function RatingInput({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(-1);
  const display = hover !== -1 ? hover : value;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Rating
        value={value ?? 0}
        readOnly={readOnly}
        onChange={(_, v) => onChange?.(v)}
        onChangeActive={(_, v) => setHover(v)}
        icon={<StarRoundedIcon fontSize="inherit" />}
        emptyIcon={<StarBorderRoundedIcon fontSize="inherit" />}
        sx={{ fontSize: '2rem', color: 'secondary.main' }}
      />
      {display ? (
        <Typography variant="body2" color="text.secondary">
          {LABELS[display]}
        </Typography>
      ) : null}
    </Box>
  );
}
