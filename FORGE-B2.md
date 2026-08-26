# FORGE-B2: Game Components & Implementation

## Component Architecture

### Core Game Components

The application uses a modular component structure where each game has its own directory under `/src/components/`:

```
/components
  /anagram          - AnagramBoard.jsx
  /catmatch         - CatMatchBoard.jsx
  /chess            - ChessBoard.jsx, Board.jsx, Square.jsx, GameControls.jsx, etc.
  /colourclash      - ColourClashBoard.jsx
  /crossword        - CrosswordBoard.jsx
  /diceroll         - DiceRollBoard.jsx
  /flipcoin         - FlipCoinBoard.jsx
  /flipflop         - FlipFlopBoard.jsx
  /game2048         - Game2048Board.jsx
  /greatwall        - GreatWallBoard.jsx
  /gregsEgg         - GregsEggBoard.jsx
  /hangman          - HangmanBoard.jsx
  /kennykeno        - KennyKenoBoard.jsx
  /latcham          - LatchamBoard.jsx
  /manjual          - ManjualBoard.jsx
  /martinimatch     - MartiniMatchBoard.jsx
  /mathquiz         - MathQuizBoard.jsx
  /memory           - MemoryBoard.jsx
  /minesweeper      - MinesweeperBoard.jsx
  /nathanielninja   - NathanielNinjaBoard.jsx
  /nickofttime      - NickOfTTimeBoard.jsx
  /numbercrunch     - NumberCrunchBoard.jsx
  /puppyfetch       - PuppyFetchBoard.jsx
  /rochellespinner  - RochellesSpinnerBoard.jsx
  /samiam           - SamIAmBoard.jsx
  /scramble         - ScrambleBoard.jsx
  /snake            - SnakeBoard.jsx
  /spellingbee      - SpellingBeeBoard.jsx
  /sudoku           - SudokuBoard.jsx
  /tictactoe        - TicTacToeBoard.jsx
  /trivia           - TriviaBoard.jsx
  /typerace         - TypeRaceBoard.jsx
  /wordchain        - WordChainBoard.jsx
  /wordle           - WordleBoard.jsx, WordleKeyboard.jsx, WordleRow.jsx, WordleTile.jsx
  /wordsearch       - WordSearchBoard.jsx
```

### Shared UI Components

- **GameBoard.jsx** - Main game container wrapper
- **GamePicker.jsx** - Game selection interface
- **Header.jsx** - Top navigation and title
- **Footer.jsx** - Bottom footer section
- **Tile.jsx** - Generic tile component for matching games
- **Toast.jsx** - Notification/feedback messages
- **Confetti.jsx** - Celebration animation on win
- **LivesDisplay.jsx** - Heart icons showing remaining lives
- **ModeToggle.jsx** - Switch between Normal/Hard difficulty
- **DarkModeToggle.jsx** - Light/Dark theme toggle
- **RevealedCategory.jsx** - Display solved category row
- **BarrysBlitz.jsx** - Special game mode component

### Chess Game Components

Specialized sub-components for the chess game:
- **ChessBoard.jsx** - Main chess board container
- **Board.jsx** - 8×8 grid rendering
- **Square.jsx** - Individual chess square
- **CapturedPieces.jsx** - Display captured pieces
- **GameControls.jsx** - Move buttons and controls
- **GameStatus.jsx** - Game state display
- **MoveHistory.jsx** - Log of moves made

### Wordle Game Components

Specialized sub-components for Wordle:
- **WordleBoard.jsx** - Main container
- **WordleKeyboard.jsx** - On-screen keyboard
- **WordleRow.jsx** - Single guess row
- **WordleTile.jsx** - Individual letter tile

## Component Styling

- **CSS Modules & Inline Styles:** Most components use Tailwind CSS classes
- **Component-Specific CSS Files:**
  - `chess/chess.css` - Chess board styling
  - `game2048/game2048.css` - 2048 game styling
  - `kennykeno/kennykeno.css` - Kenny Keno styling
  - `martinimatch/MartiniMatch.css` - Martini Match styling
- **Global Styles:** `src/index.css` - Tailwind directives and global resets
- **Theme Styles:** `src/styles/BarrysBlitz.css` - Special theme for Barry's Blitz mode

## Game Data Files

Located in `/src/data/`:

- **puzzles.js** - Main puzzle library (5-group format, 20 puzzles)
- **anagramWords.js** - Word list for anagram game
- **hangmanWords.js** - Words for hangman game
- **wordleWords.js** - Valid words for Wordle
- **wordChainPuzzles.js** - Word chain puzzle definitions
- **wordSearchPuzzles.js** - Word search grid puzzles
- **memoryCards.js** - Memory game card pairs
- **triviaQuestions.js** - Trivia question bank
- **mathQuizProblems.js** - Math quiz problems
- **minesweeperData.js** - Minesweeper board configurations
- **game2048Data.js** - 2048 game initial state
- **puppyFetchData.js** - Puppy Fetch game data
- **scrambleWords.js** - Words for scramble game
- **spellingBeeData.js** - Spelling bee word lists
- **typeRacePhrases.js** - Phrases for type racing

## Utility Functions

### gameHelpers.js
- Game state management utilities
- Scoring and lives calculation
- Tile selection and validation
- Category matching logic
- Shuffle algorithms

### chessRules.js
- Chess move validation
- Piece movement rules
- Check/checkmate detection
- Castling and en passant logic
- Board state evaluation

## Custom Hooks

### useChessGame.js
- Manages chess game state
- Handles move execution
- Tracks game history
- Manages captured pieces

### useDarkMode.js
- Manages light/dark theme state
- Persists preference to localStorage
- Provides theme toggle function

## Component Patterns

### Standard Board Component Pattern
```jsx
export default function GameNameBoard() {
  const [gameState, setGameState] = useState(initialState);
  const [lives, setLives] = useState(5);
  const [won, setWon] = useState(false);
  
  const handleGameAction = () => { /* ... */ };
  
  return (
    <GameBoard>
      {/* Game UI */}
    </GameBoard>
  );
}
```

### Tile-Based Game Pattern
- Uses Tile.jsx component for clickable elements
- Manages selection state
- Validates selections against categories
- Displays feedback via Toast.jsx

### Turn-Based Game Pattern
- Manages current player/turn
- Validates moves
- Updates board state
- Checks win/loss conditions

## Testing Coverage

Test files in `src/__tests__/`:
- **allBoards.smoke.test.js** - Smoke tests for all game boards
- **chessBoard.test.js** - Chess game logic tests
- **game2048.test.js** - 2048 game tests
- **gameHelpers.test.js** - Utility function tests
- **memoryMatchGames.test.js** - Memory game tests
- **matchingGameVisuals.test.js** - Visual regression tests
- **wordChain.test.js** - Word chain puzzle tests
- **typeRace.test.js** - Type race game tests
- **DarkModeToggle.test.js** - Theme toggle tests
- **useDarkMode.test.js** - Hook tests
