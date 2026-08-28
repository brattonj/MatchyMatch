/**
 * @file TriviaBoard.jsx
 * @description Trivia quiz game with 10 multiple-choice questions across various categories.
 * Features category display, answer review, and score calculation with percentage ring.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onNewGame - Callback to start a new quiz
 * @returns {React.ReactElement} Trivia game with questions, choices, and results
 * 
 * @state {Array} questions - Array of 10 trivia questions with choices and answers
 * @state {number} qIndex - Current question index (0-9)
 * @state {string|null} selected - Currently selected answer letter (A-D) or null
 * @state {boolean} answered - Whether current question has been answered
 * @state {number} score - Number of correct answers
 * @state {Array<string|null>} userAnswers - Array of user answers for all questions
 * @state {boolean} shaking - Whether question card is shaking (error animation)
 * @state {string|null} toast - Toast message or null
 */

import { useState, useCallback } from "react";
import { clsx } from "clsx";
import Toast from "../Toast";
import { pickQuestions, LETTERS } from "../../data/triviaQuestions";

const TOTAL_QUESTIONS = 10;

// ── Category pill ────────────────────────────────────────────────────────────

function CategoryPill({ label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        background: "var(--accent-light)",
        color: "var(--accent)",
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

// ── Answer choice button ─────────────────────────────────────────────────────

function ChoiceButton({ letter, text, state, onClick }) {
  // state: 'idle' | 'selected' | 'correct' | 'wrong' | 'reveal'
  const isSelected = state === "selected";
  const isCorrect  = state === "correct";
  const isWrong    = state === "wrong";
  const isReveal   = state === "reveal"; // correct answer revealed after wrong pick

  const bgStyle = isCorrect || isReveal
    ? { background: "rgba(52,199,89,0.12)", border: "1.5px solid rgba(52,199,89,0.6)", color: "#1a7a35" }
    : isWrong
    ? { background: "rgba(255,59,48,0.10)", border: "1.5px solid rgba(255,59,48,0.5)", color: "#c0392b" }
    : isSelected
    ? { background: "var(--accent-light)", border: "1.5px solid var(--accent)", color: "var(--accent)", boxShadow: "0 0 0 3px rgba(0,122,255,0.10)" }
    : { background: "var(--bg-surface)", border: "0.5px solid rgba(0,0,0,0.08)", color: "var(--label-primary)", boxShadow: "var(--shadow-sm)" };

  const letterBg = isCorrect || isReveal
    ? { background: "rgba(52,199,89,0.2)", color: "#1a7a35" }
    : isWrong
    ? { background: "rgba(255,59,48,0.15)", color: "#c0392b" }
    : isSelected
    ? { background: "var(--accent)", color: "#fff" }
    : { background: "var(--fill-tertiary)", color: "var(--label-secondary)" };

  return (
    <button
      onClick={onClick}
      disabled={state !== "idle" && state !== "selected"}
      className="tile-transition w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      style={{
        cursor: state === "idle" || state === "selected" ? "pointer" : "default",
        ...bgStyle,
      }}
    >
      {/* Letter badge */}
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: 28,
          height: 28,
          fontSize: "0.8rem",
          fontWeight: 700,
          ...letterBg,
        }}
      >
        {letter}
      </span>
      {/* Answer text */}
      <span style={{ fontSize: "0.9rem", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.35 }}>
        {text}
      </span>
      {/* Icon */}
      {(isCorrect || isReveal) && (
        <span className="ml-auto text-base">✓</span>
      )}
      {isWrong && (
        <span className="ml-auto text-base">✗</span>
      )}
    </button>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--label-tertiary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Question {current} of {total}
        </span>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 6,
          borderRadius: 999,
          background: "var(--fill-tertiary)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: "linear-gradient(90deg, var(--accent), #5856d6)",
            transition: "width 0.4s cubic-bezier(0.34,1.2,0.64,1)",
          }}
        />
      </div>
    </div>
  );
}

// ── Score summary row ─────────────────────────────────────────────────────────

function SummaryRow({ question, userAnswer, correctAnswer, index }) {
  const correct = userAnswer === correctAnswer;
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3"
      style={{
        background: correct ? "rgba(52,199,89,0.07)" : "rgba(255,59,48,0.07)",
        border: `0.5px solid ${correct ? "rgba(52,199,89,0.25)" : "rgba(255,59,48,0.25)"}`,
      }}
    >
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: correct ? "#1a7a35" : "#c0392b", flexShrink: 0, marginTop: 1 }}>
        {correct ? "✓" : "✗"}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--label-primary)", lineHeight: 1.35 }}>
          {index + 1}. {question.question}
        </p>
        {!correct && (
          <p style={{ fontSize: "0.75rem", color: "var(--label-tertiary)" }}>
            Your answer: <span style={{ color: "#c0392b", fontWeight: 600 }}>{LETTERS[["A","B","C","D"].indexOf(userAnswer)]} — {question.choices[["A","B","C","D"].indexOf(userAnswer)]}</span>
            {" · "}Correct: <span style={{ color: "#1a7a35", fontWeight: 600 }}>{correctAnswer} — {question.choices[["A","B","C","D"].indexOf(correctAnswer)]}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main board ───────────────────────────────────────────────────────────────

export default function TriviaBoard() {
  const [questions] = useState(() => pickQuestions(TOTAL_QUESTIONS));
  const [gameKey, setGameKey]   = useState(0);

  return (
    <Game
      key={gameKey}
      questions={questions}
      onNewGame={() => setGameKey((k) => k + 1)}
    />
  );
}

function Game({ questions, onNewGame }) {
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState(null);   // 'A'|'B'|'C'|'D' or null
  const [answered, setAnswered]     = useState(false);  // locked in?
  const [score, setScore]           = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);   // array of 'A'|'B'|'C'|'D'
  const [gameState, setGameState]   = useState("playing"); // 'playing' | 'done'
  const [toast, setToast]           = useState(null);
  const [shaking, setShaking]       = useState(false);

  const question = questions[qIndex];
  const isLast   = qIndex === questions.length - 1;

  const showToast = useCallback((msg) => setToast(msg), []);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const handleSelect = (letter) => {
    if (answered) return;
    setSelected((prev) => (prev === letter ? null : letter));
  };

  const handleConfirm = () => {
    if (!selected || answered) return;

    const correct = selected === question.answer;
    setAnswered(true);

    if (correct) {
      setScore((s) => s + 1);
      showToast("Correct! 🎉");
    } else {
      triggerShake();
      showToast("Wrong answer 😬");
    }

    setUserAnswers((prev) => [...prev, selected]);
  };

  const handleNext = () => {
    if (isLast) {
      setGameState("done");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const getChoiceState = (letter) => {
    if (!answered) {
      return selected === letter ? "selected" : "idle";
    }
    if (letter === question.answer) return "correct";
    if (letter === selected && selected !== question.answer) return "wrong";
    return "idle";
  };

  const finalScore = gameState === "done" ? score : score;
  const pct = Math.round((finalScore / TOTAL_QUESTIONS) * 100);

  const resultEmoji =
    pct === 100 ? "🏆" :
    pct >= 80   ? "🌟" :
    pct >= 60   ? "👍" :
    pct >= 40   ? "🤔" : "📚";

  const resultTitle =
    pct === 100 ? "Perfect score!" :
    pct >= 80   ? "Excellent!" :
    pct >= 60   ? "Good job!" :
    pct >= 40   ? "Not bad!" : "Keep learning!";

  // ── Done screen ──────────────────────────────────────────────────
  if (gameState === "done") {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        {/* Score card */}
        <div
          className="spring-pop flex flex-col items-center gap-5 p-8 rounded-3xl w-full"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)" }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: pct >= 60
                ? "linear-gradient(145deg, #34c759, #30d158)"
                : "linear-gradient(145deg, #ff9f0a, #ff6b00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: pct >= 60
                ? "0 8px 24px rgba(52,199,89,0.35)"
                : "0 8px 24px rgba(255,159,10,0.35)",
            }}
          >
            {resultEmoji}
          </div>

          <div className="flex flex-col items-center gap-1">
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
              {resultTitle}
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
              You scored{" "}
              <span style={{ color: "var(--label-primary)", fontWeight: 700 }}>{finalScore}</span>
              {" "}out of{" "}
              <span style={{ color: "var(--label-primary)", fontWeight: 700 }}>{TOTAL_QUESTIONS}</span>
            </p>
          </div>

          {/* Score ring */}
          <div className="flex items-center justify-center" style={{ position: "relative", width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--fill-tertiary)" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={pct >= 60 ? "#34c759" : "#ff9f0a"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.2,0.64,1)" }}
              />
            </svg>
            <span style={{ position: "absolute", fontSize: "1.4rem", fontWeight: 800, color: "var(--label-primary)", letterSpacing: "-0.03em" }}>
              {pct}%
            </span>
          </div>

          <button onClick={onNewGame} className="btn-primary">
            Play Again
          </button>
        </div>

        {/* Answer review */}
        <div className="w-full flex flex-col gap-2">
          <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--label-tertiary)", marginBottom: 4 }}>
            Review
          </p>
          {questions.map((q, i) => (
            <SummaryRow
              key={q.id}
              question={q}
              userAnswer={userAnswers[i]}
              correctAnswer={q.answer}
              index={i}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Playing screen ───────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Progress */}
      <ProgressBar current={qIndex + 1} total={TOTAL_QUESTIONS} />

      {/* Score badge */}
      <div className="self-end flex items-center gap-1.5">
        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--label-tertiary)" }}>Score:</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 10px",
            borderRadius: 999,
            background: "var(--accent-light)",
            color: "var(--accent)",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          {score} / {TOTAL_QUESTIONS}
        </span>
      </div>

      {/* Question card */}
      <div
        className={clsx("w-full rounded-3xl p-6 flex flex-col gap-4", shaking && "wordle-shake")}
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-md)" }}
      >
        <CategoryPill label={question.category} />
        <p
          style={{
            fontSize: "clamp(1rem, 3vw, 1.15rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--label-primary)",
            lineHeight: 1.4,
          }}
        >
          {question.question}
        </p>
      </div>

      {/* Choices */}
      <div className="w-full flex flex-col gap-2.5">
        {LETTERS.map((letter, i) => (
          <ChoiceButton
            key={letter}
            letter={letter}
            text={question.choices[i]}
            state={getChoiceState(letter)}
            onClick={() => handleSelect(letter)}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full justify-center mt-1">
        {!answered ? (
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="btn-primary"
            style={{ minWidth: 140 }}
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary"
            style={{ minWidth: 140 }}
          >
            {isLast ? "See Results →" : "Next Question →"}
          </button>
        )}
      </div>

      {/* Instruction nudge */}
      {!answered && !selected && (
        <p
          className="text-center"
          style={{ fontSize: "0.78rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em", maxWidth: 300 }}
        >
          Select an answer, then tap <strong>Confirm</strong>.
        </p>
      )}
    </div>
  );
}
