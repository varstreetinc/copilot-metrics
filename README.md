Copilot Dashboard (Vite + React)

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Fetch the latest Copilot metrics report using the GitHub API:

```bash
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <REPLACE_WITH_TOKEN>" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/orgs/varstreetinc/copilot/metrics/reports/users-28-day/latest
```

3. Place your latest `copilot_report-YYYY-MM-DD.json` file in `public/` folder. The app currently expects `copilot_report-2026-01-13.json` by default. Rename your file to match or edit `src/App.jsx` to load a different filename.

3. Run the dev server:

```bash
npm run dev
```

Open http://localhost:5173

Files:
- `src/` - React app
- `public/` - Put JSON files here for the dev server to serve

You can extend the app by adding more charts in `src/charts`.
