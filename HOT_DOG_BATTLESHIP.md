# Hot Dog Battleship

A fun twist on the classic Battleship game, featuring hot dogs of varying lengths and flies as missiles!

## Game Overview

Hot Dog Battleship is a strategy game where players place hot dogs on a grid and then battle against an AI opponent by shooting flies to sink their opponent's hot dogs.

## Game Mechanics

### Setup Phase

In the setup phase, players place their hot dogs on an 8×8 grid:

- **Footlong** (5 cells) - The longest hot dog
- **Chicago Dog** (4 cells) - A hearty dog
- **Brat** (3 cells) - A shorter sausage
- **Wiener** (2 cells) - The smallest hot dog

Players can:
- Click on a cell to place a hot dog
- Toggle between horizontal (↔️) and vertical (↕️) placement
- Use the Random (🎲) button to auto-place all remaining hot dogs
- Reset (🔄) to start over

### Battle Phase

Once all hot dogs are placed, the battle begins:

1. **Player's Turn**: Click on cells in the opponent's grid to shoot flies
   - 💥 **Hit**: You hit an opponent's hot dog
   - 💨 **Miss**: You missed
   - 🌭 **Hot Dog**: Your own hot dog (shown on your grid)

2. **AI's Turn**: The AI automatically shoots at your grid
   - The AI uses a simple strategy: after hitting a hot dog, it tries to hit adjacent cells
   - Otherwise, it shoots randomly

3. **Winning**: Sink all of your opponent's hot dogs to win!

## Game Features

- **Two-phase gameplay**: Setup and battle phases
- **AI opponent**: Simple but strategic AI that learns from hits
- **Visual feedback**: Clear emoji indicators for game state
- **Responsive design**: Works on desktop and mobile devices
- **Play Again**: Restart the game anytime

## Strategy Tips

1. **Placement**: Spread your hot dogs out to make them harder to find
2. **Pattern**: Look for patterns in your hits to locate opponent's hot dogs
3. **Efficiency**: Try to sink all hot dogs in the fewest shots possible

## Technical Details

- **Grid Size**: 8×8 cells
- **Hot Dogs**: 4 types with lengths 2-5 cells
- **AI Logic**: Greedy algorithm that prioritizes adjacent cells after hits
- **Game State**: Managed with React hooks (useState, useCallback)

## Files

- `src/components/hotdogbattleship/HotDogBattleshipBoard.jsx` - Main game component
- Registered in `src/components/GamePicker.jsx`
- Routed in `src/App.jsx`
- Tested in `src/__tests__/allBoards.smoke.test.js`
