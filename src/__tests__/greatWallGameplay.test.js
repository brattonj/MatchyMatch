// Regression test for a bug found by manual browser testing: the
// canvas-setup effect's dependency array included `gameState`, so every
// state transition (e.g. clicking to go from 'ready' to 'playing')
// re-ran the whole effect — which unconditionally calls initGame() again,
// resetting gameState straight back to 'ready' (and wiping score/lives/
// bricks with it). The game was completely unstartable: every click to
// play silently reset it.
//
// `clientWidth` is mocked to a real value throughout (rather than relying
// on the ResizeObserver fallback) so that, on the buggy code, the effect's
// re-run takes the *synchronous* resize path on every gameState change —
// matching what actually happens in a real, already-laid-out browser.
import { render, fireEvent, cleanup } from '@testing-library/react';
import GreatWallBoard from '../components/greatwall/GreatWallBoard';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

function mockCanvasContext() {
  const fillTextCalls = [];
  const ctx = new Proxy(
    { fillText: (text) => fillTextCalls.push(text) },
    { get: (target, prop) => (prop in target ? target[prop] : () => {}) }
  );
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  return fillTextCalls;
}

test('clicking to start the game does not immediately reset it back to the ready screen', () => {
  const fillTextCalls = mockCanvasContext();
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(640);

  const { container } = render(<GreatWallBoard />);

  expect(fillTextCalls).toContain('Click to Start');
  fillTextCalls.length = 0;

  const canvas = container.querySelector('canvas');
  fireEvent.click(canvas);

  // The bug's signature is that initGame() runs again immediately after
  // the click (because the setup effect re-ran), which redraws the ready
  // screen right back.
  expect(fillTextCalls).not.toContain('Click to Start');
});
