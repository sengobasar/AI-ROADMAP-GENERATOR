import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Move Bootstrap here
import "./index.css";
import AlternativeApp from "./AlternativeApp";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AlternativeApp />
  </React.StrictMode>
);
