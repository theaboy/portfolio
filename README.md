# Aymane Radouane Portfolio (React + Vite)

Modern single-page portfolio with a premium dark aesthetic, reusable components, and content-driven data files.

## Stack

- React + Vite + TypeScript
- Plain CSS (design system via CSS variables)
- Minimal dependencies

## Project Structure

```txt
src/
  components/
    Navbar.tsx
    Hero.tsx
    Section.tsx
    ProjectCard.tsx
    SkillGrid.tsx
    Timeline.tsx
    Contact.tsx
  data/
    projects.ts
    skills.ts
  App.tsx
  main.tsx
  styles.css
```

## Run Locally

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

## Customize Content

- Hero/About/Experience/Contact text: `src/App.tsx` and `src/components/*`
- Projects: `src/data/projects.ts`
- Skills: `src/data/skills.ts`
- Theme + spacing + typography scale: `src/styles.css` in `:root`

## GitHub Pages Deployment (Vite)

### 1) Set correct base path

Edit `vite.config.ts`:

```ts
base: "/YOUR-REPO-NAME/";
```

For example, if repo is `portfolio`, keep `base: "/portfolio/"`.

### 2) Enable GitHub Pages in repo settings

- Go to `Settings -> Pages`
- Set source to `GitHub Actions`

### 3) Push to main

Workflow file is included at:

`.github/workflows/deploy.yml`

It will:

- install dependencies
- build with Vite
- deploy `dist/` to GitHub Pages

## Accessibility + Motion

- Keyboard-visible focus styles
- High-contrast palette usage
- `prefers-reduced-motion` respected for animation and scrolling
