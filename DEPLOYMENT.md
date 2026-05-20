# Deployment Guide

This document covers deployment steps for the Refund & Recoupment Tracker, including Vercel deployment, environment variable configuration, SPA routing setup, build commands, and CI/CD integration with GitHub.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Commands](#build-commands)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
  - [Deploy via Git Integration](#deploy-via-git-integration)
  - [Deploy via Vercel CLI](#deploy-via-vercel-cli)
  - [vercel.json Configuration](#verceljson-configuration)
- [SPA Routing Setup](#spa-routing-setup)
- [Static Hosting Alternatives](#static-hosting-alternatives)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Nginx](#nginx)
  - [Apache](#apache)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- A [Vercel](https://vercel.com/) account (for Vercel deployment)
- A GitHub repository containing the project source code

---

## Build Commands

| Command | Description |
|---|---|
| `npm install` | Install all project dependencies |
| `npm run dev` | Start the local development server on `http://localhost:3000` |
| `npm run build` | Create a production build in the `dist/` directory |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run all unit tests once |
| `npm run test:watch` | Run tests in watch mode |

### Production Build

```bash
npm install
npm run build
```

This generates a `dist/` directory containing the optimized static assets:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

---

## Environment Variables

The application uses Vite environment variables prefixed with `VITE_`. Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

### Available Variables

| Variable | Description | Default | Required |
|---|---|---|---|
| `VITE_APP_TITLE` | Application title displayed in the browser tab and header | `Refund & Recoupment Tracker` | No |
| `VITE_API_BASE_URL` | Base URL for API requests (leave empty to use relative paths) | _(empty)_ | No |
| `VITE_DEBUG` | Enable debug mode for verbose console logging (`true`/`false`) | `false` | No |

### Setting Environment Variables in Vercel

1. Navigate to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select the environments where the variable should be available (Production, Preview, Development)
5. Click **Save**

> **Note:** Vite embeds environment variables at build time. Changes to environment variables require a new deployment (rebuild) to take effect.

### Environment Variable Access in Code

Environment variables are accessed in the application source code via `import.meta.env`:

```javascript
const appTitle = import.meta.env.VITE_APP_TITLE;
const isDebug = import.meta.env.VITE_DEBUG === 'true';
```

> **Important:** Never use `process.env` in Vite projects. Only variables prefixed with `VITE_` are exposed to the client-side code.

---

## Vercel Deployment

### Deploy via Git Integration

This is the recommended approach for production deployments with automatic CI/CD.

1. **Push your code to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/refund-recoupment-tracker.git
   git push -u origin main
   ```

2. **Import the project in Vercel:**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Git Repository**
   - Select your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Configure build settings:**

   | Setting | Value |
   |---|---|
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |
   | Node.js Version | 18.x or higher |

4. **Add environment variables** (if needed) in the Vercel project settings

5. **Click Deploy**

Once connected, Vercel will automatically deploy:
- **Production deployments** on every push to the `main` branch
- **Preview deployments** on every push to other branches and on pull requests

### Deploy via Vercel CLI

For manual or one-off deployments:

1. **Install the Vercel CLI globally:**

   ```bash
   npm install -g vercel
   ```

2. **Log in to your Vercel account:**

   ```bash
   vercel login
   ```

3. **Deploy from the project root:**

   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Follow the CLI prompts** to link the project to your Vercel account and configure settings.

### vercel.json Configuration

The project includes a `vercel.json` file at the root that configures SPA routing rewrites:

```json
{
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**What this does:**

- All requests that do **not** match the `/assets/` directory are rewritten to `/index.html`
- This allows React Router to handle client-side routing for all application routes (`/`, `/create`, `/edit/:id`, `/search`, `/reports`)
- Static assets (JavaScript bundles, CSS files, images) in the `/assets/` directory are served directly without rewriting

**Why this is necessary:**

The Refund & Recoupment Tracker is a single-page application (SPA) using React Router DOM for client-side routing. Without these rewrites, navigating directly to a route like `/search` or refreshing the page on `/edit/REQ-123` would result in a 404 error because the server would look for a file at that path instead of serving `index.html`.

---

## SPA Routing Setup

The application uses React Router DOM v6 with `BrowserRouter` for client-side routing. The following routes are defined in `src/App.jsx`:

| Path | Component | Description |
|---|---|---|
| `/` | `Dashboard` | Main overview with summary cards and quick actions |
| `/create` | `CreateEditRequest` | New request form |
| `/edit/:id` | `CreateEditRequest` | Edit existing request by ID |
| `/search` | `SearchRequests` | Search and filter requests |
| `/reports` | `Reports` | Aggregated metrics and monthly summary |

For any hosting platform, you must configure the server to serve `index.html` for all routes that do not match a static file. This ensures that React Router can handle the routing on the client side.

---

## Static Hosting Alternatives

### Netlify

Create a `netlify.toml` file in the project root (not included by default):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Or create a `_redirects` file inside the `public/` directory:

```
/*    /index.html   200
```

### GitHub Pages

GitHub Pages does not natively support SPA routing. You can use a workaround:

1. Add a `404.html` file to the `public/` directory that redirects to `index.html`
2. Use the `gh-pages` npm package to deploy:

   ```bash
   npm install --save-dev gh-pages
   ```

3. Add a deploy script to `package.json`:

   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

4. Set the `base` option in `vite.config.js` to your repository name:

   ```javascript
   export default defineConfig({
     base: '/refund-recoupment-tracker/',
     plugins: [react()],
   });
   ```

> **Note:** GitHub Pages has limitations with SPA routing. Vercel or Netlify are recommended for production deployments.

### Nginx

Add the following to your Nginx server configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache

Create a `.htaccess` file in the `dist/` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## CI/CD with GitHub Actions

You can set up a GitHub Actions workflow to run tests and deploy automatically on every push.

### Example Workflow: Test + Deploy to Vercel

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Build project
        run: npm run build

  deploy:
    name: Deploy to Vercel
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build with Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Required GitHub Secrets

To use the GitHub Actions workflow above, add the following secrets to your GitHub repository:

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

| Secret Name | Description | How to Obtain |
|---|---|---|
| `VERCEL_TOKEN` | Vercel API token for CLI authentication | [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Your Vercel team/org ID | Run `vercel link` locally, then check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Run `vercel link` locally, then check `.vercel/project.json` |

### Alternative: Use Vercel Git Integration Instead of GitHub Actions

If you connect your GitHub repository directly to Vercel (as described in [Deploy via Git Integration](#deploy-via-git-integration)), Vercel handles CI/CD automatically. In that case, you only need a GitHub Actions workflow for running tests:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Build project
        run: npm run build
```

This ensures tests pass before Vercel deploys the changes.

---

## Troubleshooting

### Common Issues

**1. Routes return 404 on page refresh**

- **Cause:** The hosting platform is not configured to serve `index.html` for all routes
- **Solution:** Ensure your hosting platform has SPA rewrite rules configured (see [SPA Routing Setup](#spa-routing-setup))

**2. Environment variables are undefined**

- **Cause:** Variables are not prefixed with `VITE_` or were changed after the last build
- **Solution:** Ensure all client-side environment variables are prefixed with `VITE_` and trigger a new deployment after changing them

**3. Build fails with missing dependencies**

- **Cause:** `node_modules` is out of date or corrupted
- **Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

**4. Blank page after deployment**

- **Cause:** The `base` path in `vite.config.js` does not match the deployment URL
- **Solution:** For root domain deployments, ensure `base` is not set (defaults to `/`). For subdirectory deployments, set `base` to the subdirectory path

**5. Stale data after redeployment**

- **Cause:** The application uses browser `localStorage` for data persistence. Redeployments do not clear user data
- **Solution:** Users can click the **Exit** button on the Dashboard to clear all application data and reset with fresh seed data

**6. Tests fail in CI but pass locally**

- **Cause:** Differences in Node.js version or missing test setup
- **Solution:** Ensure the CI environment uses Node.js v18+ and that `npm ci` is used instead of `npm install` for deterministic installs

### Vercel Build Logs

To debug deployment issues on Vercel:

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the deployment that failed
3. Navigate to the **Build Logs** tab
4. Review the output for error messages

### Local Build Verification

Before deploying, verify the production build works locally:

```bash
npm run build
npm run preview
```

This starts a local server serving the `dist/` directory at `http://localhost:4173`. Test all routes to ensure they work correctly.