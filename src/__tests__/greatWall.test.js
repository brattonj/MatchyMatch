// Regression test for a bug found while wiring this board into the game
// picker: it measured its container's width exactly once, synchronously,
// on mount (`canvas.width = Math.min(600, container.clientWidth)`). Right
// after this view swaps in from the picker, the container can still
// measure 0 wide for a frame — and since that measurement was taken once
// and never revisited, the canvas got permanently locked at width 0
// (invisible, unplayable) with no way to recover. Verified live in a real
// browser: this happened on the very first mount after navigating in.
import { render, cleanup } from '@testing-library/react';
import GreatWallBoard from '../components/greatwall/GreatWallBoard';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

test('a 0-width container at mount does not permanently lock the canvas at width 0', () => {
  let observedCallback;
  const disconnect = jest.fn();
  const RealResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class {
    constructor(cb) {
      observedCallback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect = disconnect;
  };

  const { container } = render(<GreatWallBoard />);
  const canvas = container.querySelector('canvas');

  // jsdom's container measures 0 wide, same as the real race — the canvas
  // must not have been locked to width 0 in response.
  expect(canvas.width).not.toBe(0);
  expect(observedCallback).toBeDefined();

  // Simulate the container reporting its real size once layout settles.
  observedCallback([{ contentRect: { width: 640 } }]);

  expect(canvas.width).toBe(600); // Math.min(600, 640)
  expect(canvas.height).toBe(500);
  expect(disconnect).toHaveBeenCalled();

  window.ResizeObserver = RealResizeObserver;
});
