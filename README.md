Copilot Dashboard (Vite + React)

Quick start:

1. From the `dashboard` folder install dependencies:

```bash
cd dashboard
npm install
```

2. Place your latest `copilot_report-YYYY-MM-DD.json` file in `dashboard/public/` (create `public` folder). The app currently expects `copilot_report-2026-01-13.json` by default. Rename your file to match or edit `src/App.jsx` to load a different filename.

3. Run the dev server:

```bash
npm run dev
```

Open http://localhost:5173

Files:
- `src/` - React app
- `public/` - Put JSON files here for the dev server to serve

You can extend the app by adding more charts in `src/charts`.
