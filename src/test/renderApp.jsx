import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeModeProvider } from '../theme/ThemeModeContext';
import { ConversationsProvider } from '../state/ConversationsContext';
import App from '../App';

/**
 * Render the whole app wrapped in its providers and an in-memory router.
 * Used by integration tests that exercise real user flows.
 */
export function renderApp({ route = '/' } = {}) {
  return render(
    <ThemeModeProvider>
      <ConversationsProvider>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </ConversationsProvider>
    </ThemeModeProvider>
  );
}
