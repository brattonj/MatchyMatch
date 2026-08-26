# FORGE-B1: Project Overview & Architecture

## Project Summary

**Puzzlr** is a React + Vite web application featuring a collection of 50+ mini-games and puzzle games. The project is transitioning to a **5-group matching game format** (20 tiles, 5 categories of 4 words each) as the primary game mode.

## Technology Stack

- **Frontend Framework:** React 19.2.4 with Vite 8.2.0
- **Styling:** Tailwind CSS 4.3.0 with Vite plugin
- **Testing:** Jest 30.4.2 with React Testing Library 16.3.2
- **Linting:** ESLint 9.39.4
- **Build Tool:** Vite with @vitejs/plugin-react
- **Icons:** Lucide React 0.577.0
- **Utilities:** clsx 2.1.1

## Project Structure

```
/src
  /components          - React components for all games
  /data               - Game data, puzzles, word lists
  /hooks              - Custom React hooks (useChessGame, useDarkMode)
  /utils              - Helper functions (gameHelpers, chessRules)
  /styles             - Global and component-specific CSS
  /assets             - Images and SVG assets
  /__tests__          - Jest test files
/public               - Static assets (fonts, icons)
/scripts              - Build-time utilities (pick-puzzle.js)
/coverage             - Jest coverage reports
```

## Key Features

1. **50+ Mini-Games:** Including chess, memory, wordle, sudoku, minesweeper, and many more
2. **5-Group Matching Game:** Primary puzzle format with 5 categories × 4 words
3. **Dark Mode:** Toggle between light and dark themes
4. **Responsive Design:** Mobile-first layout with Tailwind CSS
5. **Game Picker:** UI to select from available games
6. **Lives System:** Players start with 5 lives, lose 1 per incorrect guess
7. **Difficulty Modes:** Normal (5 lives, hints) vs Hard (3 lives, no "one away" hint)

## Build & Development Scripts

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build (includes puzzle selection via `scripts/pick-puzzle.js`)
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Jest in watch mode
- `npm run test:coverage` - Generate coverage reports
- `npm run preview` - Preview production build locally

## Testing Configuration

- **Test Environment:** jsdom (browser-like environment)
- **Setup File:** jest.setup.js
- **Module Mapping:** CSS files mapped to identity-obj-proxy
- **Transform:** Babel-Jest for JS/JSX
- **Coverage:** Collected from src/**/*.{js,jsx}, excluding tests and main.jsx
- **Test Files:** Located in __tests__/ directories or named *.test.js

## Environment Variables

- `VITE_PUZZLE_INDEX` - Randomly selected puzzle index (0-19) injected at build time
- Fallback to index 0 if missing or out of range
- `.env.production` is gitignored and generated during build

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.4 | UI framework |
| react-dom | 19.2.4 | React rendering |
| vite | 8.2.0 | Build tool & dev server |
| tailwindcss | 4.3.0 | Utility-first CSS |
| jest | 30.4.2 | Testing framework |
| @testing-library/react | 16.3.2 | React component testing |
| lucide-react | 0.577.0 | Icon library |
| clsx | 2.1.1 | Conditional className utility |

## Development Notes

- React Compiler is **not enabled** due to performance impact on dev/build
- ESLint configured with React hooks and refresh plugins
- Babel configured for React JSX transformation
- No TypeScript (uses JSX with plain JavaScript)
