# MatchyMatch Repository Overview

## What This Repository Does

MatchyMatch is a React + Vite web application that hosts a collection of puzzle and game components. The primary game is **Puzzlr**, a word-matching puzzle game where players identify 5 groups of 4 related words from a shuffled grid of 20 tiles. The repository also contains numerous other mini-games and puzzle games (chess, memory, hangman, sudoku, wordle, and many more), providing a comprehensive gaming platform.

## Top-Level Directories

- **`.claude/`** — Configuration files for Claude development environment integration.
- **`.github/`** — GitHub-specific configuration including CI/CD workflows.
- **`coverage/`** — Test coverage reports and HTML coverage visualization.
- **`public/`** — Static assets served directly, including favicon, fonts, and icon sprites.
- **`scripts/`** — Utility scripts for build-time operations like puzzle selection.
- **`src/`** — Main source code directory containing all React components, game logic, data, hooks, utilities, and styles.

## Key Source Subdirectories (under `src/`)

- **`__tests__/`** — Jest test files for components and utilities.
- **`assets/`** — Image and media assets used by components.
- **`components/`** — React components for all games and UI elements (38+ game boards plus shared components).
- **`data/`** — Game data files including word lists, puzzles, and quiz questions.
- **`hooks/`** — Custom React hooks for game logic and dark mode functionality.
- **`styles/`** — Global and component-specific CSS stylesheets.
- **`utils/`** — Helper functions and utilities for game logic and common operations.
