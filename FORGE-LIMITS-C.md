# FORGE-LIMITS-C: Utilities, Hooks, and Testing Infrastructure

The `src/utils/` and `src/hooks/` directories provide shared functionality and custom React hooks used across the application.

## Utilities and Hooks

- **Game Helpers**: gameHelpers.js contains utility functions for game logic and state management
- **Chess Rules**: chessRules.js implements chess game rules and move validation
- **Custom Hooks**: useChessGame.js manages chess game state, useDarkMode.js handles theme toggling

## Testing

The `src/__tests__/` directory contains comprehensive test suites covering:
- Component smoke tests (allBoards.smoke.test.js)
- Game-specific tests (chessBoard.test.js, game2048.test.js, wordChain.test.js)
- Utility function tests (gameHelpers.test.js)
- Hook tests (useDarkMode.test.js)

Tests use Jest and React Testing Library for validation.
