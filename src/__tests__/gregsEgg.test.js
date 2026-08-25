// Regression test for a bug found by code review in GregsEggBoard's nested
// setTimeout hatch chain (spawn -> egg -> cracking -> hatched -> empty): the
// crack->hatch timeout always called `setMisses(m => m + 1)`, even when the
// player had already tapped the egg during its "cracking" bonus window (for
// 15 points) — so a successful bonus tap was also counted as a miss ~250ms
// later. The same untracked-nested-timer root cause also let these timers
// keep running (and could still mutate state) after the game had already
// ended, since `clearEggTimers` only ever tracked the outer per-cell id.
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import GregsEggBoard from '../components/gregsEgg/GregsEggBoard';

const EGG_LIFESPAN = 1500;

afterEach(() => {
  cleanup();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function grid(container) {
  return Array.from(container.querySelectorAll('div')).find(
    (d) => d.style.gridTemplateColumns === 'repeat(3, 1fr)'
  );
}

function cellButtons(container) {
  return Array.from(grid(container).querySelectorAll('button'));
}

function statValue(container, label) {
  const labelEl = Array.from(container.querySelectorAll('span')).find(
    (s) => s.textContent === label
  );
  return Number(labelEl.previousSibling.textContent);
}

function startAndSpawnFirstEgg(container) {
  // Every random pick (which empty cell spawns next) is pinned to index 0.
  jest.spyOn(Math, 'random').mockReturnValue(0);
  fireEvent.click(container.querySelector('button.btn-primary'));
  act(() => jest.advanceTimersByTime(500)); // initial spawn delay
}

test('tapping an egg during its cracking bonus window does not also count as a miss', () => {
  jest.useFakeTimers();
  const { container } = render(<GregsEggBoard />);
  startAndSpawnFirstEgg(container);

  act(() => jest.advanceTimersByTime(EGG_LIFESPAN)); // egg -> cracking
  expect(cellButtons(container)[0]).toHaveAttribute('aria-label', 'cracking egg');

  fireEvent.click(cellButtons(container)[0]); // bonus tap
  expect(statValue(container, 'Hits')).toBe(1);

  act(() => jest.advanceTimersByTime(250)); // when the crack->hatch timeout would have fired
  expect(statValue(container, 'Misses')).toBe(0);
});
