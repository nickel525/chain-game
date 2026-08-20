import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getNextTier, getTier, tierProgress } from "../../tiers";
import { makeRound } from "./puzzles";
import "./OddScoopGame.css";

const BEST_KEY = "odd-scoop-best";

function readBest() {
  const value = Number(localStorage.getItem(BEST_KEY));
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

function playRight(audioRef) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  playTone(ctx, { type: "sine", start: 523, end: 523, gain: 0.12, duration: 0.12 });
  playTone(ctx, {
    type: "triangle",
    start: 784,
    end: 392,
    gain: 0.14,
    duration: 0.18,
    delay: 0.08,
  });
}

function playWrong(audioRef) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  playTone(ctx, { type: "sine", start: 196, end: 110, gain: 0.14, duration: 0.28 });
}

function playTierUp(audioRef) {
  const ctx = getAudio(audioRef);
  if (!ctx) return;
  playTone(ctx, { type: "sine", start: 392, end: 392, gain: 0.12, duration: 0.14 });
  playTone(ctx, {
    type: "sine",
    start: 523,
    end: 523,
    gain: 0.12,
    duration: 0.16,
    delay: 0.08,
  });
}

function Score({ label, value, muted, popping, rank }) {
  return (
    <div className={`score ${muted ? "muted" : ""} ${popping ? "pop" : ""}`}>
      <span>
        {label}
        {rank ? <span className="rank-tag"> · {rank}</span> : null}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

export default function OddScoopGame() {
  const [round, setRound] = useState(makeRound);
  const [pickedId, setPickedId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(readBest);
  const [shake, setShake] = useState(false);
  const [tierUp, setTierUp] = useState(false);
  const [popNonce, setPopNonce] = useState(0);
  const audioRef = useRef(null);

  const revealed = Boolean(pickedId);
  const correct = pickedId === round.oddId;
  const tier = getTier(streak);
  const nextTier = getNextTier(tier);
  const progress = tierProgress(streak, tier, nextTier);

  useEffect(() => {
    document.title = "Odd Scoop · Dessert Games";
    return () => {
      document.title = "Dessert Games";
    };
  }, []);

  function nextRound() {
    setRound(makeRound());
    setPickedId(null);
    setShake(false);
  }

  function pick(id) {
    if (revealed) return;
    const won = id === round.oddId;
    setPickedId(id);

    if (!won) {
      setStreak(0);
      setShake(true);
      playWrong(audioRef);
      window.setTimeout(() => setShake(false), 420);
      return;
    }

    const nextStreak = streak + 1;
    const reached = getTier(nextStreak);
    const leveled = reached.min === nextStreak && reached.min > 0;
    setStreak(nextStreak);
    setPopNonce((value) => value + 1);
    playRight(audioRef);

    if (leveled) {
      setTierUp(true);
      playTierUp(audioRef);
      window.setTimeout(() => setTierUp(false), 1400);
    }

    if (nextStreak > best) {
      setBest(nextStreak);
      localStorage.setItem(BEST_KEY, String(nextStreak));
    }
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
            <h1>Odd Scoop</h1>
            <p className="lede">
              Four animals, brands, or cities — always from the same set. Tap
              the one that doesn’t belong.
            </p>
          </div>
          <div className="scores">
            <Score
              key={popNonce}
              label="Streak"
              value={streak}
              popping={popNonce > 0 && correct}
              rank={tier.name}
            />
            <Score label="Best" value={best} muted />
          </div>
        </header>

        <section className={`board scoop-board tier-${tier.id} ${tierUp ? "tier-up" : ""}`}>
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

          <div className={`scoop-grid ${shake ? "shake" : ""}`}>
            {round.cards.map((card) => {
              const isOdd = card.id === round.oddId;
              const isPick = card.id === pickedId;
              return (
                <button
                  key={card.id}
                  type="button"
                  className={[
                    "scoop",
                    isPick ? "picked" : "",
                    revealed && isOdd ? "odd" : "",
                    revealed && isPick && !isOdd ? "miss" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={revealed}
                  onClick={() => pick(card.id)}
                >
                  {card.label}
                </button>
              );
            })}
          </div>

          <p className={`scoop-rule ${revealed ? "open" : ""}`}>
            {revealed
              ? `${correct ? "That’s the one." : "Not that one."} ${round.rule}`
              : "Which one doesn’t belong?"}
          </p>

          <button className="restart" type="button" onClick={nextRound} disabled={!revealed}>
            Next scoop
          </button>
          <p className="studio">A Nikos and Vince original</p>
        </section>
      </main>
    </>
  );
}
