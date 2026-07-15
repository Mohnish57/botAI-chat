import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeModeProvider } from '../../theme/ThemeModeContext';
import MessageBubble from './MessageBubble';
import { createMessage, ROLES, REACTIONS } from '../../utils/conversation';

const renderBubble = (ui) => render(<ThemeModeProvider>{ui}</ThemeModeProvider>);

describe('MessageBubble', () => {
  it('renders assistant reaction controls', () => {
    const msg = createMessage(ROLES.ASSISTANT, 'Hello!');
    renderBubble(<MessageBubble message={msg} onReact={() => {}} />);
    expect(screen.getByRole('button', { name: /thumbs up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thumbs down/i })).toBeInTheDocument();
  });

  it('does not render reaction controls for user messages', () => {
    const msg = createMessage(ROLES.USER, 'Hi');
    renderBubble(<MessageBubble message={msg} />);
    expect(screen.queryByRole('button', { name: /thumbs up/i })).not.toBeInTheDocument();
  });

  it('calls onReact when a reaction is clicked', async () => {
    const user = userEvent.setup();
    const onReact = vi.fn();
    const msg = createMessage(ROLES.ASSISTANT, 'Hello!');
    renderBubble(<MessageBubble message={msg} onReact={onReact} />);
    await user.click(screen.getByRole('button', { name: /thumbs up/i }));
    expect(onReact).toHaveBeenCalledWith(REACTIONS.UP);
  });

  it('reflects the chosen reaction via aria-pressed', () => {
    const msg = { ...createMessage(ROLES.ASSISTANT, 'Hi'), reaction: REACTIONS.UP };
    renderBubble(<MessageBubble message={msg} onReact={() => {}} />);
    expect(screen.getByRole('button', { name: /thumbs up/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables reactions in read-only mode', () => {
    const msg = createMessage(ROLES.ASSISTANT, 'Hi');
    renderBubble(<MessageBubble message={msg} readOnly onReact={() => {}} />);
    expect(screen.getByRole('button', { name: /thumbs up/i })).toBeDisabled();
  });
});
