// ── 2048 tile colour palette ──────────────────────────────────────────────────
// Each entry maps a tile value to { bg, text, shadow }
export const TILE_STYLES = {
  2:    { bg: "#eee4da", text: "#776e65", shadow: "0 4px 12px rgba(238,228,218,0.5)" },
  4:    { bg: "#ede0c8", text: "#776e65", shadow: "0 4px 12px rgba(237,224,200,0.5)" },
  8:    { bg: "#f2b179", text: "#f9f6f2", shadow: "0 4px 12px rgba(242,177,121,0.5)" },
  16:   { bg: "#f59563", text: "#f9f6f2", shadow: "0 4px 12px rgba(245,149,99,0.5)" },
  32:   { bg: "#f67c5f", text: "#f9f6f2", shadow: "0 4px 12px rgba(246,124,95,0.5)" },
  64:   { bg: "#f65e3b", text: "#f9f6f2", shadow: "0 4px 12px rgba(246,94,59,0.5)" },
  128:  { bg: "#edcf72", text: "#f9f6f2", shadow: "0 6px 18px rgba(237,207,114,0.6)" },
  256:  { bg: "#edcc61", text: "#f9f6f2", shadow: "0 6px 18px rgba(237,204,97,0.6)" },
  512:  { bg: "#edc850", text: "#f9f6f2", shadow: "0 6px 18px rgba(237,200,80,0.6)" },
  1024: { bg: "#edc53f", text: "#f9f6f2", shadow: "0 8px 24px rgba(237,197,63,0.7)" },
  2048: { bg: "#edc22e", text: "#f9f6f2", shadow: "0 8px 28px rgba(237,194,46,0.8)" },
};

export const DEFAULT_TILE_STYLE = {
  bg: "#3c3a32",
  text: "#f9f6f2",
  shadow: "0 4px 12px rgba(60,58,50,0.4)",
};

// ── Grid helpers ──────────────────────────────────────────────────────────────

export const GRID_SIZE = 4; // 4×4

/** Return a flat array of GRID_SIZE² null cells */
export function emptyGrid() {
  return Array(GRID_SIZE * GRID_SIZE).fill(null);
}

/** Convert (row, col) → flat index */
export function idx(r, c) {
  return r * GRID_SIZE + c;
}

/** Return all empty cell indices */
export function emptyCells(grid) {
  return grid.reduce((acc, v, i) => (v === null ? [...acc, i] : acc), []);
}

/** Place a new tile (2 or 4) in a random empty cell; returns new grid */
export function spawnTile(grid) {
  const empty = emptyCells(grid);
  if (empty.length === 0) return grid;
  const pos   = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const next  = [...grid];
  next[pos]   = value;
  return next;
}

/** Slide & merge a single row (left direction); returns { row, score } */
function slideRow(row) {
  // Remove nulls
  const tiles  = row.filter((v) => v !== null);
  const merged = [];
  let score    = 0;
  let i        = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const val = tiles[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(tiles[i]);
      i++;
    }
  }
  // Pad with nulls
  while (merged.length < GRID_SIZE) merged.push(null);
  return { row: merged, score };
}

/** Rotate grid 90° clockwise (for direction abstraction) */
function rotateCW(grid) {
  const next = emptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      next[idx(c, GRID_SIZE - 1 - r)] = grid[idx(r, c)];
    }
  }
  return next;
}

/** Rotate grid 90° counter-clockwise */
function rotateCCW(grid) {
  const next = emptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      next[idx(GRID_SIZE - 1 - c, r)] = grid[idx(r, c)];
    }
  }
  return next;
}

/**
 * Apply a move in the given direction.
 * Returns { grid, score, moved }
 *   moved = true if any tile changed position or merged
 */
export function applyMove(grid, direction) {
  // Normalise: always slide LEFT, rotate grid to achieve other directions
  let working = [...grid];
  if (direction === "right") {
    // Rotate 180°
    working = rotateCW(rotateCW(working));
  } else if (direction === "up") {
    working = rotateCCW(working);
  } else if (direction === "down") {
    working = rotateCW(working);
  }

  let totalScore = 0;
  const next     = emptyGrid();

  for (let r = 0; r < GRID_SIZE; r++) {
    const row = Array.from({ length: GRID_SIZE }, (_, c) => working[idx(r, c)]);
    const { row: slid, score } = slideRow(row);
    totalScore += score;
    for (let c = 0; c < GRID_SIZE; c++) {
      next[idx(r, c)] = slid[c];
    }
  }

  // Rotate back
  let result = next;
  if (direction === "right") {
    result = rotateCW(rotateCW(result));
  } else if (direction === "up") {
    result = rotateCW(result);
  } else if (direction === "down") {
    result = rotateCCW(result);
  }

  const moved = result.some((v, i) => v !== grid[i]);
  return { grid: result, score: totalScore, moved };
}

/** Check if any move is still possible */
export function hasMovesLeft(grid) {
  if (emptyCells(grid).length > 0) return true;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const v = grid[idx(r, c)];
      if (c + 1 < GRID_SIZE && grid[idx(r, c + 1)] === v) return true;
      if (r + 1 < GRID_SIZE && grid[idx(r + 1, c)] === v) return true;
    }
  }
  return false;
}

/** Return the highest tile value on the grid */
export function maxTile(grid) {
  return Math.max(...grid.map((v) => v ?? 0));
}
