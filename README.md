# AI Trivia

A Jeopardy-style trivia game powered by Claude AI. Players choose categories, AI generates questions, and answers are evaluated using fuzzy text matching with AI fallback.

## Features

- **Custom Categories**: Players define 6 trivia categories, validated by AI to ensure they're suitable
- **AI-Generated Questions**: Claude generates 5 questions per category with increasing difficulty ($200-$1000)
- **Smart Answer Evaluation**: Fast fuzzy text matching for obvious matches, with AI fallback for nuanced judgments
- **Moderator Override**: Human moderator can override AI judgments
- **Multiplayer**: 2-8 players, turn-based question selection
- **Audio System**: Background music for different game phases and sound effects
- **Local Storage**: Game state persists in browser localStorage

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Fuzzy Matching**: fuzzball
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Required: Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Enable dev/demo game button on main menu
NEXT_PUBLIC_DEV_MODE=1
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Game Flow

1. **Main Menu**: Start a new game or demo game (if dev mode enabled)
2. **Player Setup**: Add 2-8 players
3. **Category Setup**: Enter 6 categories, AI validates and interprets each one
4. **Question Generation**: AI generates 30 questions (5 per category)
5. **Gameplay**: Players take turns selecting questions from the board
6. **Answer Evaluation**:
   - Fuzzy text match first (fast, no API call)
   - AI evaluation if fuzzy match fails
   - Moderator can override judgment
7. **Scoring**: Correct = +points, Incorrect = -points, Pass = no change
8. **Game Over**: Winner announced when all questions answered

## Audio Files

Place audio files in `/public/audio/`. See `/public/audio/README.md` for required files and recommended sources from Pixabay.

### Music (loops)
- `setup-music.mp3` - Main menu and setup screens
- `board-music.mp3` - Game board view
- `question-music.mp3` - While answering questions
- `victory-music.mp3` - Game over screen

### Sound Effects
- `sfx-correct.mp3` - AI says correct
- `sfx-incorrect.mp3` - AI says incorrect
- `sfx-points-gain.mp3` - Moderator confirms correct
- `sfx-points-lose.mp3` - Moderator confirms incorrect
- `sfx-nobody-knows.mp3` - Everyone passed

## API Rate Limiting

Built-in rate limiting: 30 requests/minute per IP address.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── evaluate-answer/   # Answer evaluation endpoint
│   │   ├── generate-questions/ # Question generation endpoint
│   │   ├── regenerate-question/ # Single question regeneration
│   │   └── validate-category/  # Category validation endpoint
│   └── page.tsx               # Main game component
├── components/
│   ├── AudioControls.tsx      # Mute/unmute controls
│   ├── CategorySetup.tsx      # Category input and validation
│   ├── GameBoard.tsx          # Jeopardy-style question grid
│   ├── PlayerSetup.tsx        # Player name entry
│   └── QuestionModal.tsx      # Question display and answer input
├── lib/
│   ├── anthropic.ts           # Claude API client
│   ├── audio.ts               # Audio manager singleton
│   ├── dev-game.ts            # Demo game data
│   ├── fuzzy-match.ts         # Fuzzy text matching
│   ├── parse-json.ts          # AI response JSON parser
│   ├── random-letters.ts      # Letter constraints for question variety
│   ├── rate-limit.ts          # API rate limiting
│   └── storage.ts             # localStorage helpers
├── test/
│   └── setup.ts               # Vitest test setup
└── types/
    └── game.ts                # TypeScript interfaces
```

## Testing

The project uses [Vitest](https://vitest.dev/) for testing.

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Unit Tests**
  - `fuzzy-match.ts` - Fuzzy text matching for answer evaluation
  - `random-letters.ts` - Letter set generation for question variety
  - `parse-json.ts` - AI response JSON parsing
  - `rate-limit.ts` - API rate limiting logic

- **API Route Tests**
  - `evaluate-answer/route.ts` - Answer evaluation with fuzzy match and AI fallback
  - `generate-questions/route.ts` - Question generation with validation

## Dev/Demo Mode

When `NEXT_PUBLIC_DEV_MODE=1`, a "Start Demo Game" button appears that loads a pre-configured game with:
- 3 players (Player 1, Player 2, Player 3)
- 6 categories with 30 pre-written questions
- No API calls needed for setup

Categories in demo mode:
- 2000-2010 Pop Music
- Web Development
- History of Vehicles
- Video Games 2010-2020
- Movies 1980-1989
- African Animals
