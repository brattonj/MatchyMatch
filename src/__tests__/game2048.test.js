// Regression test for a bug found by code review: applyMove's "up" and
// "down" branches used swapped rotation compositions, so pressing Up
// actually slid tiles toward the bottom of the grid and pressing Down
// slid them toward the top — the two directions were inverted.
import { applyMove, idx, emptyGrid, GRID_SIZE } from '../data/game2048Data';

test('moving up slides a tile toward row 0, not row 3', () => {
  const grid = emptyGrid();
  grid[idx(2, 1)] = 2;

  const { grid: result } = applyMove(grid, 'up');

  expect(result[idx(0, 1)]).toBe(2);
  expect(result[idx(GRID_SIZE - 1, 1)]).toBeNull();
});

test('moving down slides a tile toward the last row, not row 0', () => {
  const grid = emptyGrid();
  grid[idx(1, 2)] = 2;

  const { grid: result } = applyMove(grid, 'down');

  expect(result[idx(GRID_SIZE - 1, 2)]).toBe(2);
  expect(result[idx(0, 2)]).toBeNull();
});

test('two tiles in the same column merge when moving up', () => {
  const grid = emptyGrid();
  grid[idx(1, 0)] = 4;
  grid[idx(3, 0)] = 4;

  const { grid: result, score, moved } = applyMove(grid, 'up');

  expect(moved).toBe(true);
  expect(score).toBe(8);
  expect(result[idx(0, 0)]).toBe(8);
});
