import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Set to your GitHub repo name for Pages deploys, e.g. "/portfolio/".
  base: "/portfolio/",
});
