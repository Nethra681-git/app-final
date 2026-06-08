import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n.ts"; // Initialize i18n before rendering

createRoot(document.getElementById("root")!).render(<App />);
