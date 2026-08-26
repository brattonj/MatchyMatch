# MatchyMatch: Game Components Architecture

## Component Organization

The `src/components/` directory contains all UI components organized into two categories: **core components** and **game-specific boards**.

## Core Components

These reusable components form the foundation of the application:

- **GameBoard.jsx** - Main game container that manages game state, lives, and tile selection
- **GamePicker.jsx** - Interface for selecting which game to play from the available collection
- **Header.jsx** - Application header with title and navigation
- **Footer.jsx** - Application footer with credits and links
- **Tile.jsx** - Individual selectable tile component used in matching games
- **LivesDisplay.jsx** - Visual representation of remaining lives (heart icons)
- **ModeToggle.jsx** - Difficulty mode selector (Normal/Hard)
- **DarkModeToggle.jsx** - Theme switcher for light/dark mode
- **Toast.jsx** - Notification system for feedback messages
- **Confetti.jsx** - Celebration animation component for wins
- **RevealedCategory.jsx** - Displays solved category rows with color coding
- **BarrysBlitz.jsx** - Special game mode component

## Game-Specific Boards

Each game has its own dedicated board component in a subdirectory:

- **Matching Games**: Memory, Anagram, CatMatch, MartiniMatch
- **Word Games**: Wordle, WordChain, WordSearch, Hangman, Scramble, SpellingBee
- **Puzzle Games**: Sudoku, Crossword, Minesweeper, Game2048
- **Strategy Games**: Chess, TicTacToe, Snake
- **Trivia & Skill**: Trivia, MathQuiz, TypeRace, DiceRoll
- **Specialty Games**: GreatWall, GregsEgg, NathanielNinja, RochellesSpinner, and many more

Each board component manages its own game state, rules, and user interactions independently.

## Component Communication

Components communicate through:
- **Props** - Data passed from parent to child components
- **State** - Local component state managed with `useState`
- **Custom Hooks** - Shared logic via hooks like `useChessGame` and `useDarkMode`
- **Context** (implicit) - Theme context for dark mode across the app
