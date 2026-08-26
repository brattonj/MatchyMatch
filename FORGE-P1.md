# MatchyMatch: Core Game Overview

## What is MatchyMatch?

MatchyMatch is a React-based puzzle game application built with Vite that implements a 5-group matching game mode. Players are presented with 20 tiles arranged in a 5×4 grid, representing 5 categories with 4 items each. The goal is to identify all 5 categories before running out of lives.

## Game Mechanics

- **Grid Layout**: 20 tiles displayed in a 5×4 grid (5 columns, 4 rows)
- **Categories**: 5 groups of 4 words each, color-coded by difficulty tier
- **Lives System**: Players start with 5 lives; each incorrect guess costs 1 life
- **Win Condition**: Identify all 5 categories before lives reach 0
- **Loss Condition**: Run out of lives; unrevealed categories are revealed automatically

## Difficulty Tiers & Colors

| Tier | Color  | Difficulty |
|------|--------|-----------|
| 1    | Yellow | Easiest |
| 2    | Green  | Easy |
| 3    | Blue   | Medium |
| 4    | Purple | Hard |
| 5    | Pink   | Trickiest |

## Key Features

- **Mode Toggle**: Switch between Normal (5 lives, full hints) and Hard (3 lives, no "one away" hint) before first submission
- **"One Away" Hint**: Toast notification when 3 of 4 selected words match a category
- **Shuffle Button**: Randomize remaining unrevealed tiles
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Adapts to mobile and desktop screens
