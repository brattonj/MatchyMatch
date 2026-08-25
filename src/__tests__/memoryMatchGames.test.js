// These four boards (Cat Match, Flip Flop, Puppy Fetch, Martini Match) all
// implement the same "flip two cards, check for a match" mechanic with their
// own copy-pasted state machine. All four had the same bug: nothing stopped
// a third card from being flipped while a mismatched pair was still showing
// (pending its 1s flip-back), which corrupts the match check on the next
// click. Math.random is pinned so each board's shuffle is deterministic,
// which lets us target a known mismatching pair and a known matching pair.
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import CatMatchBoard from '../components/catmatch/CatMatchBoard';
import FlipFlopBoard from '../components/flipflop/FlipFlopBoard';
import PuppyFetchBoard from '../components/puppyfetch/PuppyFetchBoard';
import MartiniMatchBoard from '../components/martinimatch/MartiniMatchBoard';

afterEach(() => {
  cleanup();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// CatMatchBoard (10 pairs) and FlipFlopBoard/PuppyFetchBoard (8 pairs) all
// Fisher-Yates shuffle their deck; with Math.random pinned to 0 the
// resulting order is [0,1,1,2,2,...,N-1,N-1,0] (by pair index), regardless
// of pair count. So cards [1] and [2] are always a matching pair, and
// [0] and [1] always mismatch.
describe.each([
  ['Cat Match', CatMatchBoard, '?', 20],
  ['Flip Flop', FlipFlopBoard, '?', 16],
  ['Puppy Fetch', PuppyFetchBoard, '🦴', 16],
])('%s', (_name, Board, hiddenGlyph, cardCount) => {
  function getCards(container) {
    return Array.from(container.querySelectorAll('button.flip-card'));
  }

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    jest.useFakeTimers();
  });

  test('renders all cards face-down', () => {
    const { container } = render(<Board />);
    const cards = getCards(container);
    expect(cards).toHaveLength(cardCount);
    cards.forEach((c) => expect(c.textContent).toBe(hiddenGlyph));
  });

  test('a third card cannot be flipped while a mismatched pair is pending', () => {
    const { container } = render(<Board />);
    const cards = getCards(container);

    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    // Known mismatch: both should now be revealed (not matched).
    expect(cards[0].textContent).not.toBe(hiddenGlyph);
    expect(cards[1].textContent).not.toBe(hiddenGlyph);

    fireEvent.click(cards[5]);
    expect(cards[5].textContent).toBe(hiddenGlyph);

    const revealed = getCards(container).filter((c) => c.textContent !== hiddenGlyph);
    expect(revealed).toHaveLength(2);
  });

  test('mismatched cards flip back after the delay, then a real pair matches and stays revealed', () => {
    const { container } = render(<Board />);
    let cards = getCards(container);

    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    act(() => jest.advanceTimersByTime(1000));

    cards = getCards(container);
    cards.forEach((c) => expect(c.textContent).toBe(hiddenGlyph));

    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);
    cards = getCards(container);
    expect(cards[1].textContent).not.toBe(hiddenGlyph);
    expect(cards[2].textContent).not.toBe(hiddenGlyph);
    expect(cards[1]).toBeDisabled();
    expect(cards[2]).toBeDisabled();

    // Should stay revealed even after the mismatch-flip-back delay elapses.
    act(() => jest.advanceTimersByTime(1000));
    cards = getCards(container);
    expect(cards[1].textContent).not.toBe(hiddenGlyph);
    expect(cards[2].textContent).not.toBe(hiddenGlyph);
  });
});

describe('Martini Match', () => {
  // MartiniMatchBoard shuffles with `.sort(() => Math.random() - 0.5)`; with
  // Math.random pinned to 0 the 6 cocktails come out fully reversed and
  // paired up, so cards [0]&[1] match, [2]&[3] match, and [0]&[2] mismatch.
  function getCards(container) {
    return Array.from(container.querySelectorAll('button.martini-card'));
  }
  const hidden = '🍸';

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    jest.useFakeTimers();
  });

  test('a third card cannot be flipped while a mismatched pair is pending', () => {
    const { container } = render(<MartiniMatchBoard />);
    const cards = getCards(container);

    fireEvent.click(cards[0]);
    fireEvent.click(cards[2]);
    expect(cards[0].textContent).not.toContain(hidden);
    expect(cards[2].textContent).not.toContain(hidden);

    fireEvent.click(cards[5]);
    expect(cards[5].textContent).toContain(hidden);

    const revealed = getCards(container).filter((c) => !c.textContent.includes(hidden));
    expect(revealed).toHaveLength(2);
  });

  test('a matching pair stays revealed and is marked matched', () => {
    const { container } = render(<MartiniMatchBoard />);
    const cards = getCards(container);

    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);

    expect(cards[0]).toBeDisabled();
    expect(cards[1]).toBeDisabled();
    expect(container.textContent).toMatch(/Matched:\s*2\s*\/\s*12/);
  });
});
