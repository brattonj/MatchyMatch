// Regression test for a bug reported by the user: "I got a match and it
// didn't save it." DOG_PAIRS had four different breeds sharing the same
// emoji (and two more sharing another), while PuppyFetchBoard's match
// check compares `breed`, not `emoji`. Since a hidden card only ever shows
// "🦴", a player has no way to tell breeds apart except by the emoji once
// flipped — so two cards that looked identical (same emoji) could still be
// ruled "not a match" and flip back, which reads exactly like the game
// failing to save a real match.
import { DOG_PAIRS } from '../data/puppyFetchData';

test('every breed has a unique emoji, so visual matches always are real matches', () => {
  const emojis = DOG_PAIRS.map((p) => p.emoji);
  expect(new Set(emojis).size).toBe(emojis.length);
});
