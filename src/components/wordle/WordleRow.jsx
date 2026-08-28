/**
 * @file WordleRow.jsx
 * @description Row component for Wordle game displaying 5 tiles.
 * Manages tile states (empty, filled, active, correct, present, absent) and animations.
 * Handles duplicate letter logic when evaluating guesses against the answer.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.guess=""] - Current guess string (up to 5 letters)
 * @param {string} [props.answer=""] - Answer string for comparison (5 letters)
 * @param {boolean} [props.submitted=false] - Whether the guess has been submitted
 * @param {boolean} [props.isActive=false] - Whether this is the active row being typed
 * @param {boolean} [props.shake=false] - Whether to apply shake animation
 * @param {boolean} [props.bounce=false] - Whether to apply bounce animation
 * @returns {JSX.Element} Row of 5 WordleTile components with appropriate states
 */

import { clsx } from "clsx";
import WordleTile from "./WordleTile";

export default function WordleRow({ guess = "", answer = "", submitted = false, isActive = false, shake = false, bounce = false }) {
  const tiles = Array.from({ length: 5 }, (_, i) => {
    const letter = guess[i] || "";
    let state = "empty";

    if (!submitted) {
      if (letter) state = isActive ? "filled" : "filled";
      else state = isActive ? "active" : "empty";
    } else {
      // Compute correct / present / absent
      // We need to handle duplicate letters carefully
      const answerArr = answer.split("");
      const guessArr  = guess.split("");
      const result    = Array(5).fill("absent");

      // First pass: mark correct
      const remainingAnswer = [...answerArr];
      for (let j = 0; j < 5; j++) {
        if (guessArr[j] === answerArr[j]) {
          result[j] = "correct";
          remainingAnswer[j] = null;
        }
      }
      // Second pass: mark present
      for (let j = 0; j < 5; j++) {
        if (result[j] === "correct") continue;
        const idx = remainingAnswer.indexOf(guessArr[j]);
        if (idx !== -1) {
          result[j] = "present";
          remainingAnswer[idx] = null;
        }
      }
      state = result[i];
    }

    return { letter, state };
  });

  return (
    <div className={clsx("flex gap-2", shake && "wordle-shake")}>
      {tiles.map(({ letter, state }, i) => (
        <WordleTile
          key={i}
          letter={letter}
          state={state}
          flipDelay={submitted ? i * 120 : 0}
          bounce={bounce && submitted}
        />
      ))}
    </div>
  );
}
