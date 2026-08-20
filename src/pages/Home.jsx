import { useEffect } from "react";
import { Link } from "react-router-dom";
import { GAMES } from "../games";
import "./Home.css";

export default function Home() {
  useEffect(() => {
    document.title = "Dessert Games";
  }, []);

  return (
    <main className="page home">
      <p className="eyebrow">A little bakery of games</p>
      <h1>Dessert Games</h1>
      <p className="lede">Pick a game.</p>

      <ul className="game-grid">
        {GAMES.map((game) => (
          <li key={game.id}>
            <Link className="game-card" to={game.path}>
              <span className="game-card-tag">{game.tag}</span>
              <strong>{game.title}</strong>
              <p>{game.blurb}</p>
              <span className="game-card-play">Play</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="studio">A Nikos and Vince original</p>
    </main>
  );
}
