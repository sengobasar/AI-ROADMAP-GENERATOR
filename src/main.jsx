import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AlternativeApp from "./AlternativeApp";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AlternativeApp />
  </React.StrictMode>
);
