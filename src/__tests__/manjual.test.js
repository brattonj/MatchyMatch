// Regression test for a bug found by code review: once a word's letters
// were all guessed, the alphabet buttons stayed enabled (disabled only
// checked `isGuessed || gameOver`) for the full 1500ms "advance to next
// word" delay. A player could use that window to rack up wrong guesses and
// trigger a loss via the separate wrongGuesses effect — but the pending
// "word complete" timeout was untracked and fired anyway, unconditionally
// advancing to the next word (or declaring a win, if it was the last word)
// right after the loss screen had already appeared.
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import ManjualBoard from '../components/manjual/ManjualBoard';

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

function letterButtons(container) {
  return Array.from(container.querySelector('.grid.grid-cols-7').querySelectorAll('button'));
}

function clickLetter(container, letter) {
  const btn = letterButtons(container).find((b) => b.textContent === letter);
  fireEvent.click(btn);
}

test('the alphabet locks immediately once a word is fully guessed, before the advance delay', () => {
  jest.useFakeTimers();
  const { container } = render(<ManjualBoard />);

  // First word is SWEET — guessing S, W, E, T completes it. Each click must
  // be its own act() flush so the next click's handler sees the updated
  // `guessedLetters`, not a stale closure from before the previous click.
  ['S', 'W', 'E', 'T'].forEach((l) => clickLetter(container, l));

  // A wrong letter must be inert right away — not just after the 1500ms
  // advance timer, which is the actual window the bug exploited.
  const wrongBtn = letterButtons(container).find((b) => b.textContent === 'A');
  expect(wrongBtn).toBeDisabled();
  fireEvent.click(wrongBtn);
  expect(container.textContent).toContain('0/6'); // Wrong Guesses unchanged

  // Normal progression still works: after the full delay, score increments
  // and the game moves on to the next word.
  act(() => jest.advanceTimersByTime(1500));
  expect(container.textContent).toContain('1/10'); // Words Guessed
  expect(container.textContent).toContain('What goes inside a manju'); // FILLING's hint
});
