import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import RatingInput from '../feedback/RatingInput';

/**
 * Collects end-of-conversation feedback: an overall star rating and an
 * optional subjective comment. Submitting also marks the conversation complete.
 *
 * @param {boolean}  open
 * @param {() => void} onClose
 * @param {(feedback: { rating: number|null, comment: string }) => void} onSubmit
 * @param {{ rating: number|null, comment: string }} [initial] - prefill when editing
 */
export default function EndConversationDialog({ open, onClose, onSubmit, initial }) {
  const [rating, setRating] = useState(initial?.rating ?? null);
  const [comment, setComment] = useState(initial?.comment ?? '');

  // Reset the form each time the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setRating(initial?.rating ?? null);
      setComment(initial?.comment ?? '');
    }
  }, [open, initial]);

  const handleSubmit = () => {
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>How was this conversation?</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Overall rating
            </Typography>
            <RatingInput value={rating} onChange={setRating} />
          </Stack>

          <TextField
            label="Additional feedback (optional)"
            placeholder="What did you like? What could be better?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!rating}>
          Submit & end chat
        </Button>
      </DialogActions>
    </Dialog>
  );
}
