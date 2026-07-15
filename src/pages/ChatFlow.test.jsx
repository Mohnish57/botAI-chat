import { describe, it, expect } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';

/**
 * End-to-end flow through the real providers: send a message, get an AI reply,
 * react, end the conversation with a rating, then confirm it appears in the
 * feedback dashboard.
 */
describe('chat → feedback flow', () => {
  it('lets a user chat, react, rate, and see it in the dashboard', async () => {
    const user = userEvent.setup();
    renderApp();

    // Send a message (a question from the sample data set).
    const input = screen.getByLabelText(/message input/i);
    await user.type(input, 'What is a Promise in JavaScript?');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // The user message shows immediately (also echoed in the header + sidebar).
    expect(screen.getAllByText('What is a Promise in JavaScript?').length).toBeGreaterThan(0);

    // The AI responds after the mock delay.
    await waitFor(
      () => expect(screen.getByText(/asynchronous operation/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );

    // React with a thumbs up.
    await user.click(screen.getByRole('button', { name: /thumbs up/i }));
    expect(screen.getByRole('button', { name: /thumbs up/i })).toHaveAttribute('aria-pressed', 'true');

    // End & rate the conversation.
    await user.click(screen.getByRole('button', { name: /end & rate/i }));
    const dialog = await screen.findByRole('dialog');
    // Choose 4 stars. MUI's Rating radios carry pointer-events:none, so drive the
    // change directly with fireEvent rather than a simulated pointer click.
    fireEvent.click(within(dialog).getByLabelText('4 Stars'));
    await user.type(within(dialog).getByLabelText(/additional feedback/i), 'Very clear!');
    const submit = within(dialog).getByRole('button', { name: /submit & end chat/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    // The conversation is now completed (composer replaced with a notice).
    await waitFor(() => expect(screen.getByText(/this conversation has ended/i)).toBeInTheDocument());

    // Wait for the dialog's exit transition to finish (it aria-hides the app while open).
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // Navigate to the feedback dashboard.
    await user.click(screen.getByRole('button', { name: /feedback dashboard/i }));
    expect(await screen.findByRole('heading', { name: /feedback dashboard/i })).toBeInTheDocument();

    // The rated conversation appears with its comment.
    expect(screen.getByText(/very clear!/i)).toBeInTheDocument();
  });
});
