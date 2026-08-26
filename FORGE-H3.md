# MatchyMatch: Data Structures and Utilities

## Data Organization

The `src/data/` directory contains all game data, puzzles, and word lists used by the various games:

- **puzzles.js** - Core puzzle definitions with 5-group format (20 words per puzzle)
- **wordleWords.js** - Word list for Wordle game
- **hangmanWords.js** - Word list for Hangman game
- **anagramWords.js** - Word list for Anagram game
- **scrambleWords.js** - Word list for Scramble game
- **wordChainPuzzles.js** - Puzzle definitions for Word Chain game
- **wordSearchPuzzles.js** - Puzzle definitions for Word Search game
- **memoryCards.js** - Card definitions for Memory matching game
- **triviaQuestions.js** - Question and answer data for Trivia game
- **mathQuizProblems.js** - Math problems for Math Quiz game
- **typeRacePhrases.js** - Phrases for Type Race game
- **game2048Data.js** - Configuration for 2048 game
- **minesweeperData.js** - Configuration for Minesweeper game
- **puppyFetchData.js** - Data for Puppy Fetch game
- **spellingBeeData.js** - Data for Spelling Bee game

## Utility Functions

The `src/utils/` directory provides helper functions and game logic:

- **gameHelpers.js** - General game utilities like shuffle, validation, and state management
- **chessRules.js** - Chess-specific rules engine for move validation and game logic

## Custom Hooks

The `src/hooks/` directory contains reusable React hooks:

- **useChessGame.js** - Manages chess game state, move history, and piece tracking
- **useDarkMode.js** - Handles theme switching and persistence across sessions

## Puzzle Data Structure

Puzzles follow a standardized 5-group format:

```javascript
{
  id: number,
  date: string (ISO format, optional),
  categories: [
    {
      id: string,
      color: 'yellow' | 'green' | 'blue' | 'purple' | 'pink',
      title: string,
      words: [string, string, string, string]
    },
    // ... 4 more categories
  ]
}
```

Each puzzle contains exactly 5 categories with 4 words each (20 words total), with difficulty increasing from yellow (easiest) to pink (trickiest).
