// Regression test for a bug found by code review: handleShapeClick had no
// guard against being called again for the same shape presentation. Since
// clicking schedules an 800ms timeout before the next shape is picked (and
// `currentShape` doesn't change until then), clicking the same correct
// button twice within that window scored the hit twice.
import { render, fireEvent, cleanup } from '@testing-library/react';
import GeoffsGeometryBoard from '../components/geoffsgeometry/GeoffsGeometryBoard';

afterEach(cleanup);

const SHAPES = [
  { name: 'Circle', emoji: '⭕' },
  { name: 'Triangle', emoji: '🔺' },
  { name: 'Square', emoji: '⬜' },
  { name: 'Pentagon', emoji: '⬠' },
  { name: 'Hexagon', emoji: '⬡' },
  { name: 'Star', emoji: '⭐' },
  { name: 'Diamond', emoji: '💎' },
  { name: 'Heart', emoji: '❤️' },
]

function currentShapeName(container) {
  return container.querySelector('.text-lg.font-semibold').textContent;
}

function scoreValue(container) {
  return Number(container.querySelector('.text-2xl.font-bold').textContent);
}

test('clicking the correct shape twice in a row only scores once', () => {
  const { container } = render(<GeoffsGeometryBoard />);
  fireEvent.click(container.querySelector('button')); // Start Game

  const name = currentShapeName(container);
  const emoji = SHAPES.find((s) => s.name === name).emoji;
  const shapeGrid = container.querySelector('.grid.grid-cols-4');
  const shapeBtn = Array.from(shapeGrid.querySelectorAll('button')).find(
    (b) => b.textContent === emoji
  );

  fireEvent.click(shapeBtn);
  fireEvent.click(shapeBtn); // same shape, still displayed, well within the 800ms window

  expect(scoreValue(container)).toBe(1);
});
