"use client";
import { createContext, useContext, useMemo, useState } from "react";

const StudioContext = createContext(null);

export const THEMES = {
  amor: { name: "Amor", accent: "#ff4f91", bg: "linear-gradient(145deg,#210b18,#5d1638 55%,#11070d)", font: "Georgia" },
  casamento: { name: "Casamento", accent: "#d8b56a", bg: "linear-gradient(145deg,#17130c,#4a3820 55%,#0c0a07)", font: "Georgia" },
  familia: { name: "Família", accent: "#67c4ff", bg: "linear-gradient(145deg,#071a2b,#123d59 55%,#061019)", font: "Arial" },
  amizade: { name: "Amizade", accent: "#8ee8b2", bg: "linear-gradient(145deg,#071c16,#14523d 55%,#06110d)", font: "Arial" },
  aniversario: { name: "Aniversário", accent: "#ffd166", bg: "linear-gradient(145deg,#211306,#6b3a0d 55%,#130a03)", font: "Trebuchet MS" },
  pets: { name: "Pets", accent: "#83d5ff", bg: "linear-gradient(145deg,#071b25,#12506a 55%,#061016)", font: "Trebuchet MS" },
};

const initialState = {
  tributeId: "",
  receiverName: "",
  senderName: "",
  specialDate: "",
  category: "amor",
  letterText: "",
  themeId: "amor",
  accentColor: THEMES.amor.accent,
  background: THEMES.amor.bg,
  fontFamily: THEMES.amor.font,
  effect: "hearts",
  photos: [],
  musicMode: "youtube",
  youtubeLink: "",
  selectedTrack: null,
  plan: null,
};

export function StudioProvider({ children, seed }) {
  const [state, setState] = useState({ ...initialState, ...(seed || {}) });
  const patch = (value) => setState((current) => ({ ...current, ...(typeof value === "function" ? value(current) : value) }));
  const value = useMemo(() => ({ state, patch, setState }), [state]);
  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio precisa estar dentro de StudioProvider");
  return context;
}
