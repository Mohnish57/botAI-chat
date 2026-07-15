import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ChatPage from './pages/ChatPage';
import FeedbackPage from './pages/FeedbackPage';

/**
 * Top-level routing.
 *
 * - /                  → new/empty chat
 * - /chat/:id          → a specific conversation
 * - /feedback          → the cross-conversation feedback dashboard
 *
 * The AppLayout renders the persistent sidebar + top bar around each page.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ChatPage />} />
        <Route path="chat/:id" element={<ChatPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
