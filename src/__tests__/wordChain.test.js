// Regression test for a bug found by code review: after reaching the end
// word, `gameState` only flips from "playing" to "won" after a 250ms
// setTimeout (for the win animation). handleSubmit's guard checked only
// `gameState`, and the letter tiles were hard-coded `disabled={false}`, so a
// player who edited a letter and hit Submit within that window could push
// one more word onto the chain — inflating the step count shown on the win
// screen even though the puzzle was already solved.
import { render, fireEvent, cleanup } from '@testing-library/react';
import WordChainBoard from '../components/wordchain/WordChainBoard';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

// WORD_CHAIN_PUZZLES[0] is COLD -> WARM (par 4), solution
// COLD -> CORD -> WORD -> WARD -> WARM. WARP is a valid one-letter neighbor
// of WARM, used here to simulate a 5th submission landing in the win-delay
// window.
function submitWord(container, letters) {
  const inputs = Array.from(container.querySelectorAll('input'));
  letters.forEach((letter, i) => {
    if (inputs[i].value !== letter) {
      fireEvent.change(inputs[i], { target: { value: letter } });
    }
  });
  const submitBtn = Array.from(container.querySelectorAll('button')).find(
    (b) => b.textContent === 'Submit'
  );
  fireEvent.click(submitBtn);
}

test('a word submitted right after reaching the end is rejected, not added to the chain', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0); // picks puzzle[0]: COLD -> WARM
  const { container } = render(<WordChainBoard />);

  submitWord(container, ['C', 'O', 'R', 'D']); // CORD
  submitWord(container, ['W', 'O', 'R', 'D']); // WORD
  submitWord(container, ['W', 'A', 'R', 'D']); // WARD
  submitWord(container, ['W', 'A', 'R', 'M']); // WARM — reaches the end

  // gameState is still "playing" for the next 250ms (win-animation delay).
  // Re-querying inputs since the DOM re-renders after each submit.
  const inputsAfterWin = Array.from(container.querySelectorAll('input'));
  expect(inputsAfterWin[0]).toBeDisabled();

  submitWord(container, ['W', 'A', 'R', 'P']); // attempted extra move

  expect(container.textContent).toContain('4 steps');
  expect(container.textContent).not.toContain('WARP');
});
