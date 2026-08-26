# MatchyMatch: Game Collection

## Overview

MatchyMatch is a multi-game platform featuring 38+ distinct games across various categories. Players can select from the game picker to play different puzzle, word, action, and strategy games.

## Game Categories

### Matching & Memory Games
- **Memory**: Classic flip-and-match card game
- **Anagram**: Unscramble letters to form words
- **CatMatch**: Match items in a category-based format
- **MartiniMatch**: Themed matching game with martini-related content
- **Scramble**: Word scrambling puzzle
- **WordChain**: Connect words through shared letters
- **WordSearch**: Find hidden words in a grid

### Word & Language Games
- **Hangman**: Guess the word letter by letter
- **Wordle**: Five-letter word guessing game with color feedback
- **SpellingBee**: Create words from available letters
- **Trivia**: Answer multiple-choice trivia questions
- **TypeRace**: Race against opponents by typing phrases
- **Crossword**: Solve crossword puzzles

### Puzzle Games
- **Sudoku**: Classic number placement puzzle
- **Minesweeper**: Reveal safe squares and flag mines
- **Game2048**: Combine tiles to reach 2048
- **GreatWall**: Strategic puzzle game
- **GregsEgg**: Egg-themed puzzle challenge
- **GeoffsGeometry**: Geometry-based puzzle game

### Action & Reflex Games
- **Snake**: Classic snake game with growing length
- **FlipCoin**: Coin flip prediction game
- **FlipFlop**: Tile flipping action game
- **DiceRoll**: Dice rolling game
- **NathanielNinja**: Ninja-themed action game
- **RochellesSpinner**: Spinning wheel game

### Strategy & Specialty Games
- **Chess**: Full chess implementation with move validation
- **BarrysBlitz**: Blitz-style rapid game
- **KennyKeno**: Keno number selection game
- **MathQuiz**: Solve mathematical problems
- **NumberCrunch**: Number manipulation puzzle
- **NickOfTTime**: Time-based challenge game
- **PuppyFetch**: Fetch-themed game
- **Manjual**: Manual puzzle game
- **Latcham**: Latch-based puzzle
- **ColourClash**: Color-matching strategy game

## Game Data

Game data is stored in `src/data/`:
- **puzzles.js**: Main puzzle definitions for the 5-group matching game
- **wordleWords.js**: Word list for Wordle
- **hangmanWords.js**: Word list for Hangman
- **anagramWords.js**: Word list for Anagram
- **scrambleWords.js**: Word list for Scramble
- **wordChainPuzzles.js**: Puzzle definitions for WordChain
- **wordSearchPuzzles.js**: Puzzle definitions for WordSearch
- **triviaQuestions.js**: Trivia question database
- **typeRacePhrases.js**: Phrases for TypeRace
- **mathQuizProblems.js**: Math problems for MathQuiz
- **memoryCards.js**: Card definitions for Memory game
- **minesweeperData.js**: Minesweeper board configurations
- **game2048Data.js**: Game2048 configurations
- **puppyFetchData.js**: PuppyFetch game data
- **spellingBeeData.js**: SpellingBee word lists

## Game Selection

At build time, a random puzzle index (0-19) is selected via `scripts/pick-puzzle.js` and injected as `VITE_PUZZLE_INDEX`. This ensures all players see the same puzzle for a given deployment.
