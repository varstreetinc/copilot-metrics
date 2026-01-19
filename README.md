Copilot Dashboard (Vite + React)

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open http://localhost:5173

## Loading Data

### Option A: Fetch via UI (Recommended)

The dashboard has a built-in feature to fetch reports directly from the GitHub API:

1. Enter your GitHub Personal Access Token in the token field
2. Click **"Get Report Link"** to fetch the download URL from GitHub
3. Click **"Download Report"** to download the JSON file
4. Use the file picker to load the downloaded file into the dashboard

### Option B: Manual API Call

You can also fetch the report manually using curl:

```bash
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <REPLACE_WITH_TOKEN>" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/orgs/varstreetinc/copilot/metrics/reports/users-28-day/latest
```

This returns a JSON with `download_links` - use that URL to download the actual report, then load it via the file picker in the UI.

## Files

- `src/` - React app
- `src/charts/` - Chart components (extend by adding more here)
- `public/` - Static assets
