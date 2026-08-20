import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getNextTier, getTier, STRETCH_TIERS, tierProgress } from "../../tiers";
import { isCompleteWord, randomLetter, wordsWith } from "./dictionary";
import "./StretchGame.css";

const BEST_KEY = "stretch-best";
const ROUND_SECONDS = 120;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function readBest() {
  const raw =
    localStorage.getItem(BEST_KEY) ??
    localStorage.getItem("either-end-best") ??
    localStorage.getItem("taffy-best");
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function playTone(ctx, { type, start, end, gain, duration, delay = 0 }) {
  const when = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(start, when);
  osc.frequency.exponentialRampToValueAtTime(end, when + duration);
  amp.gain.setValueAtTime(gain, when);
  amp.gain.exponentialRampToValueAtTime(0.001, when + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

function getAudio(audioRef) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioRef.current) audioRef.current = new AudioCtx();
  const ctx = audioRef.current;
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function playPop(audioRef) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  playTone(ctx, {
    type: "triangle",
    start: 740,
    end: 220,
    gain: 0.14,
    duration: 0.1,
  });
}

function playWordSet(audioRef, length) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  const bump = Math.min(6, Math.max(0, length - 3)) * 40;
  playTone(ctx, { type: "sine", start: 392 + bump, end: 392 + bump, gain: 0.12, duration: 0.14 });
  playTone(ctx, {
    type: "sine",
    start: 494 + bump,
    end: 494 + bump,
    gain: 0.12,
    duration: 0.16,
    delay: 0.08,
  });
  playTone(ctx, {
    type: "triangle",
    start: 784 + bump,
    end: 523,
    gain: 0.16,
    duration: 0.28,
    delay: 0.16,
  });
}

function playGameOver(audioRef) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  playTone(ctx, { type: "sine", start: 220, end: 110, gain: 0.14, duration: 0.32 });
  playTone(ctx, {
    type: "triangle",
    start: 165,
    end: 70,
    gain: 0.12,
    duration: 0.4,
    delay: 0.08,
  });
}

function Score({ label, value, muted, popping, urgent }) {
  return (
    <div className={`score ${muted ? "muted" : ""} ${popping ? "pop" : ""} ${urgent ? "urgent" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LetterSlot({ id, label, inputRef, disabled, onLetter }) {
  return (
    <label className="stretch-slot" htmlFor={id}>
      <span className="stretch-slot-label">{label}</span>
      <input
        id={id}
        ref={inputRef}
        value=""
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        maxLength={1}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onLetter(event.target.value)}
      />
    </label>
  );
}

export default function StretchGame() {
  const [stem, setStem] = useState(randomLetter);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [best, setBest] = useState(readBest);
  const [gameOver, setGameOver] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [timerOn, setTimerOn] = useState(false);
  const [freshIndex, setFreshIndex] = useState(0);
  const [popNonce, setPopNonce] = useState(0);
  const [candidates, setCandidates] = useState(() => wordsWith(stem));
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const audioRef = useRef(null);

  const length = stem.length;
  const longest = candidates.reduce((max, word) => Math.max(max, word.length), length);
  const tier = getTier(length, STRETCH_TIERS);
  const nextTier = getNextTier(tier, STRETCH_TIERS);
  const progress = tierProgress(length, tier, nextTier);

  useEffect(() => {
    document.title = "Stretch · Dessert Games";
    return () => {
      document.title = "Dessert Games";
    };
  }, []);

  useEffect(() => {
    if (!gameOver) backRef.current?.focus();
  }, [gameOver]);

  useEffect(() => {
    if (!timerOn || gameOver) return undefined;
    const id = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setTimedOut(true);
          setGameOver(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerOn, gameOver]);

  useEffect(() => {
    if (timedOut) playGameOver(audioRef);
  }, [timedOut]);

  function startGame() {
    const letter = randomLetter();
    setStem(letter);
    setCandidates(wordsWith(letter));
    setError("");
    setShake(false);
    setGameOver(false);
    setTimedOut(false);
    setSecondsLeft(ROUND_SECONDS);
    setTimerOn(false);
    setFreshIndex(0);
    setPopNonce(0);
    setBest(readBest());
  }

  function fail(message) {
    setError(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  }

  function add(side, raw) {
    if (gameOver) return;
    const letter = String(raw).replace(/[^a-zA-Z]/g, "").slice(-1).toLowerCase();
    if (!letter) return;

    const next = side === "front" ? letter + stem : stem + letter;
    const nextCandidates = candidates.filter((word) => word.includes(next));
    if (nextCandidates.length === 0) {
      fail("That doesn’t stretch toward a word.");
      const slot = side === "front" ? frontRef : backRef;
      slot.current?.focus();
      return;
    }

    const finished = isCompleteWord(next);
    setStem(next);
    setCandidates(nextCandidates);
    setError("");
    setFreshIndex(side === "front" ? 0 : next.length - 1);
    setPopNonce((value) => value + 1);
    setTimerOn(true);

    if (finished) {
      setGameOver(true);
      playWordSet(audioRef, next.length);
      if (next.length > best) {
        setBest(next.length);
        localStorage.setItem(BEST_KEY, String(next.length));
      }
      return;
    }

    playPop(audioRef);
    window.requestAnimationFrame(() => {
      const slot = side === "front" ? frontRef : backRef;
      slot.current?.focus();
    });
  }

  return (
    <>
      <main className="page">
        <header className="top">
          <div>
            <Link className="back-link" to="/">
              All games
            </Link>
            <p className="brand">Dessert Games</p>
            <p className="eyebrow">{tier.name} rank</p>
            <h1>Stretch</h1>
            <p className="lede">
              Type a letter at the beginning or the end of the whole string. The
              round ends as soon as you spell a real word — make it a long one.
            </p>
          </div>
          <div className="scores">
            <Score
              label="Time"
              value={formatTime(secondsLeft)}
              muted
              urgent={timerOn && secondsLeft <= 10 && !gameOver}
            />
            <Score key={popNonce} label="Length" value={length} popping={popNonce > 0} />
            <Score label="Best" value={best} muted />
          </div>
        </header>

        <section className={`board stretch-board tier-${tier.id}`}>
          <div className="rank">
            <div className="rank-copy">
              <strong>{tier.name}</strong>
              <span>
                {nextTier
                  ? `${nextTier.min - length} more to ${nextTier.name}`
                  : "Max rank"}
              </span>
            </div>
            <div className="rank-bar" aria-hidden="true">
              <i style={{ width: `${progress * 100}%` }} />
            </div>
          </div>

          <p className="stretch-longest">
            Longest possible: {longest}
          </p>
          <div className={`stretch-row ${shake ? "shake" : ""}`}>
            <LetterSlot
              id="stretch-front"
              label="Add to start"
              inputRef={frontRef}
              disabled={gameOver}
              onLetter={(value) => add("front", value)}
            />
            <ol className="stretch-stem" aria-label={`Current letters: ${stem}`}>
              {stem.split("").map((letter, index) => (
                <li
                  key={`${letter}-${index}-${index === freshIndex ? popNonce : "set"}`}
                  className={`stretch-tile ${index === freshIndex ? "fresh" : ""}`}
                >
                  {letter.toUpperCase()}
                </li>
              ))}
            </ol>
            <LetterSlot
              id="stretch-back"
              label="Add to end"
              inputRef={backRef}
              disabled={gameOver}
              onLetter={(value) => add("back", value)}
            />
          </div>
          {error && <p className="error">{error}</p>}

          <button className="restart" type="button" onClick={startGame}>
            New word
          </button>
          <p className="studio">A Nikos and Vince original</p>
        </section>
      </main>

      {gameOver && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="stretch-over-title">
          <div className="modal">
            {timedOut ? (
              <>
                <p className="eyebrow">Timer dinged</p>
                <h2 id="stretch-over-title">Game over</h2>
                <p>
                  You didn’t finish a real word in time. You had stretched it to{" "}
                  <strong>{stem.toUpperCase()}</strong>.
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow">That’s a word</p>
                <h2 id="stretch-over-title">{stem.toUpperCase()}</h2>
                <p>
                  You built it out to <strong>{length}</strong>{" "}
                  {length === 1 ? "letter" : "letters"}.
                </p>
              </>
            )}
            <div className="modal-stats">
              <Score label="Length" value={length} />
              <Score label="Best" value={best} muted />
            </div>
            <button type="button" onClick={startGame}>
              Play again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
