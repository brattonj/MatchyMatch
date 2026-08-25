// Regression test for a bug found by code review: the three decoy options
// were drawn independently from the correct number with `randomNumber(1,100)`
// and no exclusion of the correct value or of each other, so two options
// (including possibly a decoy equal to the correct answer) could show the
// same number — breaking the "find the correct number" premise and letting
// two buttons for the same value coexist.
import { render, cleanup, waitFor } from '@testing-library/react';
import NathanielNinjaBoard from '../components/nathanielninja/NathanielNinjaBoard';

function optionValues(container) {
  const grid = Array.from(container.querySelectorAll('div')).find(
    (d) => d.style.gridTemplateColumns === 'repeat(2, 1fr)'
  );
  return Array.from(grid.querySelectorAll('button')).map((b) => b.textContent.trim());
}

test('the four answer options are always distinct, across many rounds', async () => {
  // Random each render — run enough iterations that a flawed "no exclusion"
  // implementation would almost certainly produce a duplicate somewhere.
  for (let i = 0; i < 40; i++) {
    const { container, unmount } = render(<NathanielNinjaBoard />);
    // Options populate via a setTimeout(0) effect, not synchronously.
    await waitFor(() => expect(optionValues(container)).toHaveLength(4));
    const values = optionValues(container);
    expect(new Set(values).size).toBe(4);
    unmount();
    cleanup();
  }
});
