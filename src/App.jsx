import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GAMES } from "./games";
import Home from "./pages/Home.jsx";
import "./App.css";

function GameFallback() {
  return (
    <main className="page">
      <p className="lede">Loading…</p>
    </main>
  );
}

export default function App() {
  return (
    <div className="shell">
      <Suspense fallback={<GameFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          {GAMES.map((game) => (
            <Route key={game.id} path={game.path} element={<game.Component />} />
          ))}
          <Route path="/taffy" element={<Navigate to="/stretch" replace />} />
          <Route path="/either-end" element={<Navigate to="/stretch" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
