import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// 🌟 終極外掛：強制叫 Tailwind CSS 來上班排版！
const script = document.createElement("script");
script.src = "https://cdn.tailwindcss.com";
document.head.appendChild(script);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
