# botAI — Chat & Feedback

A single-page React application where a user chats with a (mocked) AI model and
gives **multi-fold feedback** on every conversation:

- 👍 / 👎 **thumbs** on each AI answer — hidden by default, they fade in on hover.
- ⭐ a **5-star rating** at the end of a conversation.
- 📝 **subjective written feedback** at the end of a conversation.

Conversations are saved locally and can be revisited from the sidebar (with their
feedback shown read-only), and a dedicated **Feedback Dashboard** aggregates every
rated conversation into a filterable/sortable table.

> Bonus implemented: **light / dark mode** toggle (persisted, respects OS preference).

---

## ✨ Features

| Area | What you can do |
| --- | --- |
| **Chat** | Start a new chat, send messages, get mocked AI responses with a typing indicator. Suggested prompts help you get going. |
| **Per-answer feedback** | Hover an AI reply to reveal 👍/👎. Click to react; click again to undo. |
| **End-of-chat feedback** | Click **End & rate** to give a 1–5 star rating and an optional comment. This marks the chat completed (read-only). |
| **History** | Every conversation is listed in the sidebar with its date and, once rated, a star chip. Open any past chat to review it and its feedback. Delete chats you don't need. |
| **Feedback Dashboard** | A table with one row per rated conversation. Aggregate stat cards (count, average rating, total 👍/👎), filter by exact rating, free-text search over titles/comments, and sort by date or rating. Click a row to jump into that conversation. |
| **Dark mode** | Toggle in the top bar; the choice is remembered. |
| **Responsive** | Permanent sidebar on desktop, drawer on mobile. |
| **Persistence** | Everything is stored in `localStorage`, so it survives refresh. |

---

## 🚀 Getting started

Requires **Node 18+**.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

### Tests & linting

```bash
npm test          # run the unit + integration test suite once
npm run test:watch # watch mode
npm run coverage  # coverage report
npm run lint      # ESLint
```

---

## 🧪 How to use the app

1. Open the app — you land on an empty chat with a few suggested prompts.
2. Type a message (try *“What is a Promise in JavaScript?”* or *“Can you explain RESTful APIs?”*) and press **Enter**.
3. Hover the AI's reply to reveal the 👍 / 👎 buttons and react.
4. Continue the conversation as long as you like.
5. Click **End & rate** (top right), give a star rating + optional comment, and submit.
6. The chat is now saved and read-only. Find it any time in the left sidebar.
7. Open the **Feedback dashboard** (sidebar) to see all feedback across chats, filter
   by rating, search comments, and sort.

---

## 🧩 Mock AI data

AI responses are mocked from [`src/data/mockResponses.json`](src/data/mockResponses.json) —
this is the **provided sample data set** verbatim: a flat array of
`{ id, question, response }` objects. The matcher ([`src/utils/mockAi.js`](src/utils/mockAi.js))
resolves a user message in three increasingly forgiving passes:

1. exact (case-insensitive) match on the question,
2. substring containment (message contains the question, or vice-versa),
3. token-overlap scoring — the question sharing the most meaningful words wins,
   above a small threshold,

otherwise it returns a friendly `DEFAULT_RESPONSE`. This means slightly reworded
questions (e.g. *“How can I improve security for my web app?”*) still find the right
answer. To extend the knowledge base, just add more `{ id, question, response }`
entries to the JSON — no code changes needed.

---

## 🏗️ Technical choices & reasoning

- **Vite + React 18** — fast dev server and build, minimal config, first-class
  Vercel support.
- **JavaScript (not TypeScript)** — chosen per the brief. JSDoc comments document
  the important shapes (conversation/message/feedback) so intent stays clear.
- **Material UI (MUI v6)** — mature, accessible component library that covers the
  whole surface (tables, dialogs, ratings, drawers, theming) and gives a
  consistent, polished look with built-in light/dark theming.
- **State: `useReducer` + Context** — all conversation mutations live in a single
  **pure reducer** ([`conversationsReducer.js`](src/state/conversationsReducer.js)).
  This keeps business logic framework-agnostic and trivially unit-testable, while
  the [`ConversationsProvider`](src/state/ConversationsContext.jsx) is a thin
  wrapper that wires it to `localStorage` and exposes ergonomic action helpers.
  For an app this size a reducer+context is the right weight — no need for Redux.
- **Persistence via `localStorage`** — no backend required (per the brief), and it
  cleanly satisfies “conversations get saved and can be revisited”. All access is
  funnelled through [`storage.js`](src/utils/storage.js) so it could be swapped for
  an API/IndexedDB by changing one file.
- **Routing: React Router** — `/` (new chat), `/chat/:id` (a conversation),
  `/feedback` (dashboard). URLs make conversations shareable/bookmarkable and keep
  navigation state out of component state.
- **Pure selectors** for the dashboard
  ([`feedbackStats.js`](src/utils/feedbackStats.js)) — filtering, sorting and
  aggregation are pure functions, so the view stays declarative and the logic is
  unit tested directly.
- **Testing: Vitest + React Testing Library** — same transform pipeline as Vite,
  fast, and RTL encourages testing behaviour over implementation. Coverage spans
  pure logic (matcher, reducer, selectors), a component (`MessageBubble`), and a
  full **chat → react → rate → dashboard** integration flow.

### Project structure

```
src/
├── data/            mockResponses.json          # the mock AI knowledge base
├── state/           conversationsReducer.js     # pure state transitions (tested)
│                    ConversationsContext.jsx    # provider + localStorage wiring
├── theme/           theme.js                    # light/dark MUI themes
│                    ThemeModeContext.jsx        # mode toggle + persistence
├── utils/           mockAi.js                   # question → response matcher (tested)
│                    conversation.js             # domain model factories/helpers (tested)
│                    feedbackStats.js            # dashboard selectors (tested)
│                    storage.js  format.js
├── components/
│   ├── layout/      AppLayout.jsx  Sidebar.jsx
│   ├── chat/        ChatInput, MessageBubble, MessageContent, TypingIndicator,
│   │                EmptyState, EndConversationDialog
│   └── feedback/    RatingInput, FeedbackSummary, StatCard
├── pages/           ChatPage.jsx  FeedbackPage.jsx
└── test/            setup.js  renderApp.jsx
```

---

## 🎨 Design choices & reasoning

- **Familiar chat layout** — sidebar for history/navigation, a centered message
  column, composer pinned to the bottom. Users don't have to learn anything new.
- **Feedback that stays out of the way** — thumbs are hidden until you hover an
  answer (as specified), but remain visible once you've reacted so your choice is
  never lost. End-of-chat rating uses a friendly modal so it doesn't clutter the
  chat flow.
- **Completed = read-only** — once a conversation is rated it's locked and shows a
  feedback summary banner (rating, comment, 👍/👎 counts). This makes “revisiting a
  past conversation and seeing the feedback” unambiguous, and you can still edit the
  feedback if needed.
- **Dashboard as a table** — one row per conversation makes ratings, reactions and
  comments scannable and sorting/filtering natural. Stat cards up top give an
  at-a-glance sense of overall sentiment. Rows are clickable to drill into the chat.
- **Cohesive theming** — a single theme definition drives both modes; colours,
  radius and typography are centralised so the app reads as one system in light or
  dark.
- **Accessibility** — semantic roles, `aria-label`/`aria-pressed` on the reaction
  buttons, keyboard-friendly input (Enter to send, Shift+Enter for newline).

---

## ⚖️ Trade-offs & what I'd do next

Deliberate scope choices for the time budget:

- **`localStorage` over a backend** — meets the requirements without infra. A real
  app would persist server-side (and add auth). The `storage.js` boundary makes
  that swap easy.
- **Tiny in-house markdown renderer** ([`MessageContent.jsx`](src/components/chat/MessageContent.jsx))
  handles bold/lists/line-breaks without pulling in a full markdown engine. For
  richer responses I'd switch to `react-markdown`.
- **Mocked, synchronous “AI”** with a small artificial delay for a realistic typing
  state — no streaming. Wiring to a real model API would slot in behind
  `getAiResponse`.

With more time I would add:

- **Streaming responses** and message editing/regeneration.
- **Export / import** of conversations (JSON/CSV) from the dashboard.
- **More dashboard analytics** — rating trend over time, per-message reaction drill-down.
- **E2E tests** (Playwright) and visual regression tests.
- **Migrating to TypeScript** for compile-time guarantees on the data model.
- **Virtualised** message and dashboard lists for very large histories.

---

## ☁️ Deployment (Vercel)

This is a static SPA. On Vercel:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

[`vercel.json`](vercel.json) adds a SPA rewrite so client-side routes like
`/feedback` and `/chat/:id` resolve to `index.html` on refresh/deep-link.
