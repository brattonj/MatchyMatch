// Regression test for a bug found by code review: calcAccuracy compared
// only the *current* typed string against the target, with no memory of
// past keystrokes. Since finishing requires typed === target exactly, that
// comparison was mathematically guaranteed to read 100% at completion no
// matter how many typos were made and corrected along the way — the
// "Accuracy" stat and "Perfect accuracy!" badge were effectively dead code.
import { render, fireEvent, cleanup } from '@testing-library/react';
import TypeRaceBoard from '../components/typerace/TypeRaceBoard';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

function getInput(container) {
  return container.querySelector('input[aria-label="Type the phrase here"]');
}

function accuracyStat(container) {
  const label = Array.from(container.querySelectorAll('span')).find(
    (s) => s.textContent === 'Accuracy'
  );
  return label.previousSibling.textContent;
}

test('a typo that is corrected before finishing still lowers final accuracy', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0); // picks TYPE_RACE_PHRASES[0]
  const { container } = render(<TypeRaceBoard />);
  const input = getInput(container);
  const target = 'The mitochondria is the powerhouse of the cell.';

  fireEvent.change(input, { target: { value: 'X' } }); // wrong first character
  fireEvent.change(input, { target: { value: '' } }); // backspace it out
  fireEvent.change(input, { target: { value: target } }); // type it correctly

  expect(container.textContent).toContain('Done!');
  expect(container.textContent).not.toContain('Perfect accuracy!');
  expect(accuracyStat(container)).not.toBe('100%');
});

test('typing the phrase with no mistakes gives 100% accuracy', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const { container } = render(<TypeRaceBoard />);
  const input = getInput(container);
  const target = 'The mitochondria is the powerhouse of the cell.';

  fireEvent.change(input, { target: { value: target } });

  expect(container.textContent).toContain('Perfect accuracy!');
  expect(accuracyStat(container)).toBe('100%');
});
