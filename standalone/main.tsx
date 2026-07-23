import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DukeMapClient from "../app/DukeMapClient";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DukeMapClient />
  </StrictMode>,
);
