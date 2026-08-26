# MatchyMatch: Component Architecture

## Core Components

### Main Application Structure

- **App.jsx**: Root component that manages overall app state and routing between game picker and game board
- **GamePicker.jsx**: Displays available games and allows selection; shows game descriptions and metadata
- **GameBoard.jsx**: Main game container that orchestrates the puzzle game logic and UI

### UI Components

- **Header.jsx**: Top navigation bar with title and mode controls
- **Footer.jsx**: Bottom section with credits and links
- **Tile.jsx**: Individual selectable tile component representing a word
- **RevealedCategory.jsx**: Displays a successfully matched category with its color and title
- **LivesDisplay.jsx**: Shows remaining lives as heart icons (💜)
- **ModeToggle.jsx**: Toggle control for switching between Normal and Hard difficulty modes
- **Toast.jsx**: Notification system for feedback messages (e.g., "One away!", incorrect guess)
- **Confetti.jsx**: Celebration animation component for win state
- **DarkModeToggle.jsx**: Theme switcher for light/dark mode

## Game-Specific Components

The `src/components/` directory contains 38+ game implementations, each in its own subdirectory:

- **Matching Games**: Memory, Anagram, CatMatch, MartiniMatch, Scramble, WordChain, WordSearch
- **Word Games**: Hangman, Wordle, SpellingBee, Trivia, TypeRace, Crossword
- **Puzzle Games**: Sudoku, Minesweeper, Game2048, GreatWall, GregsEgg, GeoffsGeometry
- **Action Games**: Snake, FlipCoin, FlipFlop, DiceRoll, NathanielNinja, RochellesSpinner
- **Specialty Games**: Chess, BarrysBlitz, KennyKeno, MathQuiz, NumberCrunch, NickOfTTime, PuppyFetch, Manjual, Latcham, ColourClash

Each game component follows the pattern: `[GameName]Board.jsx` as the main entry point.

## State Management

- **React Hooks**: Uses `useState` for local component state
- **Custom Hooks**: `useChessGame` for chess-specific logic, `useDarkMode` for theme persistence
- **Props Drilling**: Components pass state and callbacks through props

## Styling

- **Global Styles**: `src/index.css` contains base styles and Tailwind-like utility classes
- **Component Styles**: Game-specific CSS files (e.g., `chess.css`, `game2048.css`, `kennykeno.css`)
- **Theme Support**: Dark mode implemented via CSS variables and class-based styling
