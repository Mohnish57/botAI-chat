import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  Container,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import StatCard from '../components/feedback/StatCard';
import { useConversations } from '../state/ConversationsContext';
import { toFeedbackRows, aggregateStats, filterAndSortRows } from '../utils/feedbackStats';
import { formatDateTime } from '../utils/format';

/**
 * Cross-conversation feedback dashboard.
 *
 * Shows aggregate stats up top, then a filterable/sortable table where each row
 * is the feedback for one conversation. Filtering by rating and free-text search
 * make it easy to find, e.g., every 1-star conversation. Clicking a row opens
 * that conversation.
 */
export default function FeedbackPage() {
  const { conversations } = useConversations();
  const navigate = useNavigate();

  const [rating, setRating] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');

  const rows = useMemo(() => toFeedbackRows(conversations), [conversations]);
  const stats = useMemo(() => aggregateStats(rows), [rows]);
  const visibleRows = useMemo(
    () => filterAndSortRows(rows, { rating, query, sort }),
    [rows, rating, query, sort]
  );

  return (
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Feedback dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Every rated conversation in one place. Filter by rating or search the comments.
        </Typography>

        {/* Aggregate stats */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
          <StatCard
            icon={<ForumRoundedIcon color="primary" />}
            label="Rated conversations"
            value={stats.total}
          />
          <StatCard
            icon={<StarRoundedIcon sx={{ color: 'secondary.main' }} />}
            label="Average rating"
            value={stats.total ? stats.averageRating.toFixed(1) : '—'}
            color="secondary.main"
          />
          <StatCard
            icon={<ThumbUpAltRoundedIcon color="success" />}
            label="Thumbs up"
            value={stats.totalUp}
          />
          <StatCard
            icon={<ThumbDownAltRoundedIcon color="error" />}
            label="Thumbs down"
            value={stats.totalDown}
          />
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            label="Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            sx={{ minWidth: 160 }}
            size="small"
          >
            <MenuItem value="all">All ratings</MenuItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <MenuItem key={r} value={r}>
                {r} star{r > 1 ? 's' : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            sx={{ minWidth: 160 }}
            size="small"
          >
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="oldest">Oldest first</MenuItem>
            <MenuItem value="highest">Highest rating</MenuItem>
            <MenuItem value="lowest">Lowest rating</MenuItem>
          </TextField>

          <TextField
            placeholder="Search title or comment…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Conversation</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Reactions</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell align="right">Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <InsightsRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">
                        {rows.length === 0
                          ? 'No feedback yet. Finish a conversation and rate it to see it here.'
                          : 'No conversations match these filters.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => navigate(`/chat/${row.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography fontWeight={500} noWrap>
                        {row.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.messageCount} messages
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Rating value={row.rating ?? 0} readOnly size="small" icon={<StarRoundedIcon fontSize="inherit" />} />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Chip size="small" icon={<ThumbUpAltRoundedIcon />} label={row.thumbsUp} variant="outlined" color="success" />
                        <Chip size="small" icon={<ThumbDownAltRoundedIcon />} label={row.thumbsDown} variant="outlined" color="error" />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      {row.comment ? (
                        <Tooltip title={row.comment}>
                          <Typography variant="body2" noWrap sx={{ fontStyle: 'italic' }}>
                            “{row.comment}”
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(row.submittedAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
