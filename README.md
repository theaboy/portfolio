# Aymane Radouane - Portfolio Website

Personal portfolio built to present my experience in machine learning, backend systems, and full-stack development.

## Overview

This project is a production-style React portfolio that centralizes my:

- Education and technical foundation
- Internship experience
- Technical projects with impact details
- Skills and certifications
- Contact and resume access

## Key Features

- Resume-driven content architecture via typed data models
- Interactive "Resume Chatbot" that answers from structured resume data
- Project case study modal (problem, approach, technologies, impact)
- 3D technical architecture section using Three.js (`@react-three/fiber`, `@react-three/drei`)
- Scroll reveal animations with reduced-motion support
- Responsive single-page layout with reusable section components

## Tech Stack

- React 19
- TypeScript
- Vite
- Three.js + React Three Fiber + Drei
- Plain CSS

## Project Structure

```txt
src/
  components/          # UI sections and interactive modules
  data/                # Resume content, selectors, and skill mappings
  assets/              # Project visuals and skill icons
  App.tsx              # Page composition and modal behavior
  main.tsx             # React bootstrap
  styles.css           # Global styles and design system tokens
public/
  Aymane_Radouane_Resume.pdf
.github/workflows/
  deploy.yml           # GitHub Pages deployment pipeline
```

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Content Management

Update portfolio content in:

- `src/data/resumeData.ts` (identity, education, experience, projects, skills, certifications, leadership)

Behavior and page composition:

- `src/App.tsx`
- `src/components/ResumeChatbot.tsx`

## Deployment (GitHub Pages)

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Ensure `vite.config.ts` uses the correct base path:

```ts
base: "/portfolio/";
```

2. In your repository settings, set Pages source to `GitHub Actions`.
3. Push to `main` to trigger build and deployment.

## Internship Focus

This portfolio is designed to communicate:

- Ability to ship polished user-facing applications
- Strong foundation in ML + backend + systems
- Experience translating project work into clear technical narratives

## Contact

- Email: `rad.aymane@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/aymane-radouane`
- GitHub: `https://github.com/theaboy`
