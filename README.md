# Fitness Program App

A comprehensive fitness tracking application that allows trainers to create training programs for trainees and track their progress.

## Features

- **Trainer Dashboard**: Create and manage training programs
- **Trainee Interface**: View programs and log training sessions
- **Progress Tracking**: Compare week-over-week performance
- **1RM Calculator**: Estimate one-rep max using various formulas
- **Modern UI/UX**: Beautiful, responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser (or the port shown when you run `npm run dev`)

## Demo

To show the app with pre-loaded data:

1. **First-time setup:** After migrations, run `npm run demo:setup` (seeds exercises and creates demo users/programmes/sessions).
2. **Start the app:** `npm run demo` (or `npm run dev`).
3. **Use the script:** See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for a one-page presenter flow and credentials. Full walkthrough: [DEMO.md](DEMO.md).

## Deployment

For web (Vercel + PostgreSQL), PWA install, and optional iOS/Android app distribution, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Tech Stack

- Next.js 16 (React Framework)
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Recharts (Data Visualization)
