import { Box, Typography } from '@mui/material';

/**
 * Minimal, dependency-free renderer for the small subset of markdown our mock
 * responses use: **bold**, line breaks, and `-`/`1.` list items. This keeps the
 * bundle light while still letting responses look formatted.
 *
 * (For a production app I'd reach for `react-markdown`; here a tiny parser avoids
 * pulling in a markdown engine for a handful of formatting cases.)
 */

/** Split a line into React nodes, converting **bold** segments. */
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    return bold ? (
      <strong key={i}>{bold[1]}</strong>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

export default function MessageContent({ text }) {
  const lines = String(text).split('\n');

  return (
    <Box>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed === '') return <Box key={i} sx={{ height: 8 }} />;

        const bullet = trimmed.match(/^[-*]\s+(.*)$/);
        const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);

        if (bullet || numbered) {
          const marker = bullet ? '•' : `${numbered[1]}.`;
          const content = bullet ? bullet[1] : numbered[2];
          return (
            <Box key={i} sx={{ display: 'flex', gap: 1, my: 0.25 }}>
              <Typography component="span" sx={{ minWidth: 16, color: 'text.secondary' }}>
                {marker}
              </Typography>
              <Typography component="span">{renderInline(content)}</Typography>
            </Box>
          );
        }

        return (
          <Typography key={i} sx={{ my: 0.25, lineHeight: 1.6 }}>
            {renderInline(line)}
          </Typography>
        );
      })}
    </Box>
  );
}
