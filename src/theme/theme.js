import { createTheme } from '@mui/material/styles';

/**
 * Builds the MUI theme for a given mode ('light' | 'dark').
 *
 * Colours, shape and typography are centralised here so the whole app shares
 * one visual language and both modes stay consistent.
 */
export function buildTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#8b7cf6' : '#6C5CE7' },
      secondary: { main: '#00B894' },
      background: {
        default: isDark ? '#0f1117' : '#f6f7fb',
        paper: isDark ? '#171a23' : '#ffffff',
      },
      success: { main: '#00B894' },
      error: { main: '#ff6b6b' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: { defaultProps: { disableElevation: true } },
    },
  });
}
