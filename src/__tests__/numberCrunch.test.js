// Regression test for a bug found by code review: handleUndo un-used "the
// last two used tiles" by scanning slot array positions in reverse order,
// rather than the specific pair of positions the most-recent step actually
// combined. If an earlier step used a tile sitting at a higher array index
// than a tile used by the most recent step, undo un-used the wrong tile —
// leaving the just-undone step's tile stuck as "used" while an unrelated,
// still-valid earlier step's tile became selectable again.
import { render, fireEvent, cleanup } from '@testing-library/react';
import NumberCrunchBoard from '../components/numbercrunch/NumberCrunchBoard';

afterEach(cleanup);

function getTileGrid(container) {
  return container.querySelector('.grid.grid-cols-3');
}

function tiles(container) {
  return Array.from(getTileGrid(container).querySelectorAll('button'));
}

test('undo restores exactly the pair of tiles used by the most recent step', () => {
  const { container } = render(<NumberCrunchBoard />);

  const plusBtn = () =>
    Array.from(container.querySelectorAll('button.op-btn')).find((b) => b.textContent === '+');

  // Step 1: combine original tiles at positions 0 and 5 (addition is always
  // valid for these positive Countdown numbers, so this can't be rejected).
  fireEvent.click(plusBtn());
  fireEvent.click(tiles(container)[0]);
  fireEvent.click(tiles(container)[5]);

  // Step 2: combine original tiles at positions 1 and 2.
  fireEvent.click(plusBtn());
  fireEvent.click(tiles(container)[1]);
  fireEvent.click(tiles(container)[2]);

  // Slots are now: [0 used, 1 used, 2 used, 3, 4, 5 used, result1(used by
  // nothing), result2] — 8 tiles total.
  expect(tiles(container)).toHaveLength(8);
  expect(tiles(container)[0]).toBeDisabled();
  expect(tiles(container)[1]).toBeDisabled();
  expect(tiles(container)[2]).toBeDisabled();
  expect(tiles(container)[5]).toBeDisabled();

  const undoBtn = Array.from(container.querySelectorAll('button')).find((b) =>
    b.textContent.includes('Undo')
  );
  fireEvent.click(undoBtn);

  // Step 2 (positions 1 and 2) should be undone; step 1 (positions 0 and 5)
  // must stay intact.
  const afterUndo = tiles(container);
  expect(afterUndo).toHaveLength(7);
  expect(afterUndo[0]).toBeDisabled();
  expect(afterUndo[5]).toBeDisabled();
  expect(afterUndo[1]).not.toBeDisabled();
  expect(afterUndo[2]).not.toBeDisabled();
});
