# MatchyMatch: Project Overview

## What is MatchyMatch?

MatchyMatch is a React-based web application that hosts a collection of puzzle and game experiences. The project is built with **React + Vite** and provides a modern, responsive interface for playing various matching games, word puzzles, and brain teasers.

## Core Architecture

The application is structured around a **game picker interface** that allows users to select from dozens of different games, each with its own unique gameplay mechanics and rules. The main entry point is `src/App.jsx`, which orchestrates the overall application layout including header, game board, and footer components.

## Key Features

- **Dark Mode Support**: Toggle between light and dark themes via `DarkModeToggle` component
- **Multiple Game Modes**: Over 40 different games and puzzles available
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Toast Notifications**: User feedback system for game events and hints
- **Confetti Celebrations**: Visual feedback for game wins

## Technology Stack

- **Framework**: React 18+ with Vite for fast development and builds
- **Styling**: Tailwind CSS for utility-first styling
- **Testing**: Jest for unit and integration tests
- **Linting**: ESLint for code quality
- **Build Tool**: Vite with HMR (Hot Module Replacement) for rapid development

## Project Structure

- `src/App.jsx` - Main application component
- `src/components/` - Reusable UI components and game boards
- `src/data/` - Game data, puzzles, and word lists
- `src/hooks/` - Custom React hooks for game logic
- `src/utils/` - Helper functions and game rules
- `src/__tests__/` - Test files for components and utilities
