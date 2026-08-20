import { useEffect, useRef, useState } from "react";
import {
  CATEGORIES,
  firstLetter,
  getCategory,
  lastLetter,
} from "./catalog";
import { getNextTier, getTier, tierProgress, TIERS } from "./tiers";
import "./App.css";

const BURST_DOTS = 10;
const CATEGORY_KEY = "chain-category";
const ROUND_SECONDS = 90;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function readBest(category) {
  const raw = localStorage.getItem(category.bestKey);
  if (raw !== null) {
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  }
  if (category.id === "animals") {
    const legacy = Number(localStorage.getItem("animal-chain-best"));
    return Number.isFinite(legacy) ? legacy : 0;
  }
  return 0;
}

function readCategoryId() {
  const saved = localStorage.getItem(CATEGORY_KEY);
  return CATEGORIES.some((category) => category.id === saved)
    ? saved
    : CATEGORIES[0].id;
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

function playPop(audioRef, tierIndex) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  const bump = tierIndex * 40;
  playTone(ctx, {
    type: "triangle",
    start: 920 + bump,
    end: 240,
    gain: 0.14,
    duration: 0.1,
  });
  playTone(ctx, {
    type: "sine",
    start: 160 + bump / 4,
    end: 55,
    gain: 0.18,
    duration: 0.18,
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

function playTierUp(audioRef) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  playTone(ctx, { type: "sine", start: 392, end: 392, gain: 0.12, duration: 0.16 });
  playTone(ctx, {
    type: "sine",
    start: 494,
    end: 494,
    gain: 0.12,
    duration: 0.16,
    delay: 0.08,
  });
  playTone(ctx, {
    type: "triangle",
    start: 784,
    end: 523,
    gain: 0.16,
    duration: 0.28,
    delay: 0.16,
  });
}

export default function App() {
  const [categoryId, setCategoryId] = useState(readCategoryId);
  const category = getCategory(categoryId);
  const [chain, setChain] = useState(() => [getCategory(readCategoryId()).random()]);
  const [guess, setGuess] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [best, setBest] = useState(() => readBest(getCategory(readCategoryId())));
  const [popping, setPopping] = useState(false);
  const [popNonce, setPopNonce] = useState(0);
  const [tierUp, setTierUp] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [timerOn, setTimerOn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef(null);
  const chainRef = useRef(null);
  const audioRef = useRef(null);

  const current = chain[chain.length - 1];
  const required = lastLetter(current);
  const streak = Math.max(0, chain.length - 1);
  const tier = getTier(streak);
  const nextTier = getNextTier(tier);
  const progress = tierProgress(streak, tier, nextTier);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chain.length]);

  useEffect(() => {
    chainRef.current?.scrollTo({
      left: chainRef.current.scrollWidth,
      behavior: "smooth",
    });
  }, [chain]);

  useEffect(() => {
    if (!timerOn || gameOver) return undefined;
    const id = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setGameOver(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerOn, gameOver]);

  useEffect(() => {
    if (gameOver) playGameOver(audioRef);
  }, [gameOver]);

  function startChain(nextCategory) {
    setChain([nextCategory.random()]);
    setGuess("");
    setError("");
    setPopping(false);
    setPopNonce(0);
    setTierUp(false);
    setSecondsLeft(ROUND_SECONDS);
    setTimerOn(false);
    setGameOver(false);
    setBest(readBest(nextCategory));
  }

  function changeCategory(nextId) {
    const nextCategory = getCategory(nextId);
    setCategoryId(nextCategory.id);
    localStorage.setItem(CATEGORY_KEY, nextCategory.id);
    startChain(nextCategory);
  }

  function fail(message) {
    setError(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  }

  function submit(name) {
    if (gameOver) return;
    const next = name.trim();
    if (!next) {
      fail(`Type ${category.article} ${category.singular} name first.`);
      return;
    }
    if (!category.isValid(next)) {
      fail(`That’s not in the ${category.singular} database.`);
      return;
    }
    if (firstLetter(next) !== required) {
      fail(
        `Next ${category.singular} must start with “${required.toUpperCase()}”.`
      );
      return;
    }
    if (chain.some((item) => category.matches(next, item))) {
      fail(`You already used that ${category.singular} in this chain.`);
      return;
    }

    const canonical = category.display(next);
    const nextChain = [...chain, canonical];
    const nextStreak = nextChain.length - 1;
    const reached = getTier(nextStreak);
    const leveled = reached.min === nextStreak && reached.min > 0;

    setChain(nextChain);
    setGuess("");
    setError("");
    setPopping(true);
    setPopNonce((n) => n + 1);
    setSecondsLeft(ROUND_SECONDS);
    setTimerOn(true);
    playPop(audioRef, Math.max(0, TIERS.findIndex((item) => item.id === reached.id)));

    if (leveled) {
      setTierUp(true);
      playTierUp(audioRef);
      window.setTimeout(() => setTierUp(false), 1400);
    }

    if (nextStreak > best) {
      setBest(nextStreak);
      localStorage.setItem(category.bestKey, String(nextStreak));
    }
  }

  return (
    <div className="shell">
      <main className="page">
        <header className="top">
          <div>
            <p className="brand">Dessert Games</p>
            <p className="eyebrow">{tier.name} rank</p>
            <h1>{category.label} Chain</h1>
            <p className="lede">
              Name {category.article} {category.singular} that starts with the last
              letter of the previous one. Keep the chain going and grow your streak.
            </p>
          </div>
          <div className="scores">
            <Score
              label="Time"
              value={formatTime(secondsLeft)}
              muted
              urgent={timerOn && secondsLeft <= 10 && !gameOver}
            />
            <Score
              key={popNonce}
              label="Streak"
              value={streak}
              popping={popping}
              rank={tier.name}
            />
            <Score label="Best" value={best} muted />
          </div>
        </header>

        <section className={`board tier-${tier.id} ${tierUp ? "tier-up" : ""}`}>
          <div className="rank">
            <div className="rank-copy">
              <strong>{tier.name}</strong>
              <span>
                {nextTier
                  ? `${nextTier.min - streak} more to ${nextTier.name}`
                  : "Max rank"}
              </span>
            </div>
            <div className="rank-bar" aria-hidden="true">
              <i style={{ width: `${progress * 100}%` }} />
            </div>
          </div>

          {tierUp && (
            <p key={tier.id} className="tier-banner">
              {tier.name} unlocked
            </p>
          )}

          <div className="board-top">
            <label className="picker" htmlFor="category">
              Chain type
              <select
                id="category"
                value={categoryId}
                onChange={(event) => changeCategory(event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="need">
              <span className="need-copy">
                Next {category.singular} must start with
              </span>
              <span key={popNonce} className={`letter ${popping ? "pop" : ""}`}>
                {required.toUpperCase()}
              </span>
            </p>
          </div>

          <ol className="chain" ref={chainRef}>
            {chain.map((item, index) => {
              const fresh = popping && index === chain.length - 1;
              return (
                <li
                  key={`${item}-${index}`}
                  className={`link ${index === chain.length - 1 ? "latest" : ""} ${fresh ? "fresh" : ""}`}
                >
                  <article className="card">
                    {fresh && (
                      <>
                        <span className="ring" />
                        <span className="burst" aria-hidden="true">
                          {Array.from({ length: BURST_DOTS }, (_, dot) => (
                            <i
                              key={dot}
                              style={{
                                "--angle": `${(360 / BURST_DOTS) * dot}deg`,
                                "--delay": `${dot * 12}ms`,
                              }}
                            />
                          ))}
                        </span>
                      </>
                    )}
                    <span className="step">{index + 1}</span>
                    <strong>{category.display(item)}</strong>
                    <em>
                      {firstLetter(item).toUpperCase()}
                      <span>→</span>
                      {lastLetter(item).toUpperCase()}
                    </em>
                  </article>
                  {index < chain.length - 1 && <span className="arrow">→</span>}
                </li>
              );
            })}
          </ol>

          <form
            className={`play ${shake ? "shake" : ""}`}
            onSubmit={(event) => {
              event.preventDefault();
              submit(guess);
            }}
          >
            <label htmlFor="guess">Your next {category.singular}</label>
            <div className="field">
              <input
                id="guess"
                ref={inputRef}
                value={guess}
                autoComplete="off"
                spellCheck="false"
                disabled={gameOver}
                placeholder={`Starts with ${required.toUpperCase()}…`}
                onChange={(event) => {
                  setGuess(event.target.value);
                  setError("");
                }}
              />
              <button type="submit" disabled={gameOver}>
                Add
              </button>
            </div>
            {error && <p className="error">{error}</p>}
          </form>

          <button className="restart" type="button" onClick={() => startChain(category)}>
            New chain
          </button>
          <p className="studio">A Dessert Games original</p>
        </section>
      </main>

      {gameOver && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
          <div className="modal">
            <p className="eyebrow">Timer dinged</p>
            <h2 id="game-over-title">Game over</h2>
            <p>
              You didn’t find a valid {category.singular} starting with{" "}
              <strong>{required.toUpperCase()}</strong> before the frosting set.
            </p>
            <div className="modal-stats">
              <Score label="Streak" value={streak} rank={tier.name} />
              <Score label="Best" value={best} muted />
            </div>
            <button type="button" onClick={() => startChain(category)}>
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Score({ label, value, muted, popping, rank, urgent }) {
  return (
    <div
      className={`score ${muted ? "muted" : ""} ${popping ? "pop" : ""} ${urgent ? "urgent" : ""}`}
    >
      <span>
        {label}
        {rank ? <span className="rank-tag"> · {rank}</span> : null}
      </span>
      <strong>{value}</strong>
    </div>
  );
}
