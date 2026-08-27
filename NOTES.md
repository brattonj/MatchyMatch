# MatchyMatch — A Collection of Puzzle & Game Boards

## Overview

**MatchyMatch** (also known as **Puzzlr**) is a React + Vite web application that hosts a collection of interactive puzzle and game boards. The app features a game picker interface that allows users to select from 40+ different games and puzzles, each with unique mechanics and gameplay.

## Core Features

### Main Game: Matchy (5-Group Puzzle)

The flagship game is **Matchy**, a word-grouping puzzle inspired by the New York Times' "Connections" game:

- **Grid Layout**: 20 tiles arranged in a 5×4 grid (5 columns, 4 rows)
- **Categories**: 5 groups of 4 words each, color-coded by difficulty:
  - 🟨 **Yellow** (Easiest)
  - 🟩 **Green** (Easy)
  - 🟦 **Blue** (Medium)
  - 🟪 **Purple** (Hard)
  - 🌸 **Pink** (Trickiest / Lateral thinking)
- **Gameplay**:
  - Select exactly 4 tiles to form a group
  - Submit to check if they match a category
  - Correct matches reveal the category and remove tiles
  - Wrong guesses cost 1 life (start with 5 lives)
  - "One away" hint when 3 of 4 selected tiles match
  - Shuffle and deselect buttons for control
- **Modes**: Normal (5 lives, hints enabled) and Hard (3 lives, hints disabled)
- **Puzzle Library**: 20 unique puzzles with varied themes
- **Random Selection**: At build time, a random puzzle (0–19) is selected and injected via environment variable

### Additional Games & Puzzles

The app includes 40+ additional games and puzzles:

**Word Games:**
- Wordle (guess the word in 6 tries)
- Hangman (classic word-guessing game)
- Anagram (unscramble letters)
- Scramble (find words from letters)
- Word Chain (connect words with shared letters)
- Word Search (find hidden words in a grid)
- Spelling Bee (make words from available letters)
- Crossword (fill in clues)

**Number Games:**
- Number Crunch (math puzzle)
- Math Quiz (answer math questions)
- Sudoku (classic number puzzle)
- 2048 (merge tiles to reach 2048)
- Minesweeper (reveal safe tiles)

**Trivia & Knowledge:**
- Trivia (answer trivia questions)

**Memory & Matching:**
- Memory (match pairs of cards)
- Puppy Fetch (match puppies)
- Cat Match (match cats)
- Martini Match (match cocktails)

**Strategy & Skill:**
- Chess (full chess game with move history)
- Tic Tac Toe (classic 3×3 game)
- Snake (classic snake game)
- Type Race (typing speed game)

**Specialty Games:**
- Barry's Blitz (speed-based game)
- Greg's Egg (egg-themed puzzle)
- Nathaniel Ninja (ninja-themed game)
- Nick of Time (time-based challenge)
- Colour Clash (color-matching game)
- Flip Flop (flip tiles game)
- Dice Roll (dice-based game)
- Flip Coin (coin flip game)
- Kenny Keno (keno-style game)
- Rochelle's Spinner (spinning wheel game)
- Manjual (manual puzzle)
- Latcham (latch-based puzzle)
- Geoff's Geometry (geometry puzzle)
- Great Wall (wall-building puzzle)
- Sam I Am (word-based puzzle)

## Technical Stack

- **Frontend Framework**: React 19.2.4
- **Build Tool**: Vite 8.2.0
- **Styling**: Tailwind CSS 4.3.0
- **Icons**: Lucide React 0.577.0
- **Testing**: Jest 30.4.2 with React Testing Library
- **Linting**: ESLint 9.39.4
- **Module System**: ES Modules

## Project Structure

```
src/
├── components/          # React components for each game
│   ├── GameBoard.jsx    # Main Matchy game component
│   ├── GamePicker.jsx   # Game selection interface
│   ├── Header.jsx       # App header with navigation
│   ├── Footer.jsx       # App footer
│   ├── DarkModeToggle.jsx
│   ├── ModeToggle.jsx   # Normal/Hard mode switcher
│   ├── Tile.jsx         # Individual tile component
│   ├── Toast.jsx        # Notification system
│   ├── Confetti.jsx     # Celebration animation
│   ├── LivesDisplay.jsx # Heart-based lives indicator
│   ├── RevealedCategory.jsx
│   └── [game-name]/     # Subdirectories for each game
├── data/                # Game data and puzzles
│   ├── puzzles.js       # 20 Matchy puzzles
│   ├── wordleWords.js
│   ├── hangmanWords.js
│   ├── triviaQuestions.js
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useDarkMode.js   # Dark mode state management
│   └── useChessGame.js  # Chess game logic
├── utils/               # Utility functions
│   ├── gameHelpers.js   # Common game logic
│   └── chessRules.js    # Chess rule validation
├── styles/              # Global and component styles
├── App.jsx              # Main app component
└── main.jsx             # React entry point
```

## Key Features

### Dark Mode
- Toggle between light and dark themes
- Persisted to localStorage
- Applied globally across all games

### Responsive Design
- Mobile-first approach
- Adapts grid layouts for different screen sizes
- Touch-friendly tile selection

### Game State Management
- Each game maintains its own state
- "Play Again" / "New Game" buttons reset state
- Game key mechanism ensures clean component remounting

### Accessibility
- Semantic HTML
- Keyboard navigation support
- ARIA labels for interactive elements
- Toast notifications for feedback

## Build & Deployment

### Development
```bash
npm run dev      # Start dev server with HMR
npm run lint     # Run ESLint
npm test         # Run Jest tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Production
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

### Puzzle Selection
- At build time, `scripts/pick-puzzle.js` generates a random puzzle index (0–19)
- Writes to `.env.production` (gitignored)
- Vite injects `VITE_PUZZLE_INDEX` as an environment variable
- App reads it at runtime to select the puzzle for that deployment

## Testing

- **Unit Tests**: Jest with React Testing Library
- **Coverage**: Tracked with lcov reports
- **Smoke Tests**: All game boards tested for rendering
- **Game-Specific Tests**: Logic tests for complex games (Chess, 2048, Sudoku, etc.)

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS**: Game-specific styles in component directories
- **Color System**: Consistent palette with game-specific overrides
- **Animations**: Shake, bounce, confetti effects

## Notable Implementation Details

### Matchy Game
- 5-group format with color-coded difficulty tiers
- "One away" hint system
- Lives system with visual heart indicators
- Mode toggle (Normal vs. Hard) before first submission
- Shuffle and deselect controls

### Chess Game
- Full chess rule validation
- Move history tracking
- Captured pieces display
- Game status indicators (check, checkmate, stalemate)

### Dark Mode
- Uses `prefers-color-scheme` media query as fallback
- Stored in localStorage for persistence
- Applied via `dark:` Tailwind classes

## Contributing

See `CONTRIBUTING-NOTES.md` for development guidelines.

## Related Documentation

- `SPEC.md` — Detailed specification for the 5-group Matchy game
- `COLOUR_CLASH_IMPLEMENTATION.md` — Colour Clash game implementation notes
- `BARRYS_BLITZ.md` — Barry's Blitz game documentation
- `PINBALL.md` — Pinball game notes
- `MERGE_RESOLUTION.md` — Merge conflict resolution guide
- `MERGE-PERSIST.md` — Persistence layer documentation
- `TESTING.md` — Testing guidelines

## License

See repository for license information.
