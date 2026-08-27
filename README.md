# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Checkers

A fully playable checkers game is available at `public/checkers.html`. The game features:

- **Complete game logic**: Move validation, piece captures, and turn switching
- **King promotion**: Pieces automatically become kings when reaching the opposite end
- **Multi-capture support**: Chain multiple captures in a single turn
- **Computer opponent**: The black pieces are controlled by an AI that prioritizes captures
- **Game controls**: New Game and Undo Move buttons for easy gameplay
- **Responsive design**: Works on desktop and mobile devices

To play, open `public/checkers.html` in your browser. Red pieces are controlled by the human player, and black pieces are controlled by the computer.

## 😄 A Little Joke

Why did the matching game break up with the memory game?

Because it kept finding someone **else** a perfect match! 🃏
