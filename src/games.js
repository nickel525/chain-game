import { lazy } from "react";

export const GAMES = [
  {
    id: "chain",
    path: "/chain",
    title: "Chain",
    tag: "Word streak",
    blurb: "Name the next animal, brand, city, or Pokémon from the last letter.",
    Component: lazy(() => import("./games/chain/ChainGame.jsx")),
  },
  {
    id: "stretch",
    path: "/stretch",
    title: "Stretch",
    tag: "Longest word",
    blurb: "Type letters onto the start or end of the string. Create a real word.",
    Component: lazy(() => import("./games/stretch/StretchGame.jsx")),
  },
];
