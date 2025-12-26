# Vercel Setup Instructions

This document outlines the steps to connect this repository to Vercel for deployment.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository created and pushed
- Vercel CLI installed (optional): `npm i -g vercel`

## Setup Steps

### Option 1: Via Vercel Dashboard (Recommended)

1. Log in to your Vercel account at https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Select appropriate framework (or leave as Other)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Configure environment variables:
   - Add all variables from `.env.example`
   - Set different values for Production and Preview environments as needed

6. Deploy settings:
   - **Production Branch**: `main`
   - **Preview Branches**: `develop`, `feature/*`

7. Click "Deploy"

### Option 2: Via Vercel CLI

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Link your project (run from project root):

```bash
vercel link
```

4. Add environment variables:

```bash
vercel env add <VARIABLE_NAME>
```

5. Deploy:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Branch Protection Setup

After connecting to Vercel, configure branch protection rules in GitHub:

1. Go to your repository on GitHub
2. Navigate to Settings → Branches
3. Add branch protection rule for `main`:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

4. Add branch protection rule for `develop`:
   - Require pull request reviews before merging
   - Require status checks to pass before merging

## Deployment Environments

- **Production**: Deploys from `main` branch
  - URL: `https://your-project.vercel.app`
  - Automatic deployment on push to `main`

- **Preview/Staging**: Deploys from `develop` and `feature/*` branches
  - URL: `https://your-project-<branch>-<hash>.vercel.app`
  - Automatic deployment on push to these branches

## Environment Variables

Ensure all required environment variables from `.env.example` are added to Vercel:

- Navigate to Project Settings → Environment Variables
- Add variables for each environment (Production, Preview, Development)
- Use different values as appropriate for each environment

## Continuous Deployment

Vercel automatically deploys:

- Every push to `main` → Production
- Every push to `develop` → Preview (staging)
- Every push to `feature/*` branches → Preview

## Monitoring

Access deployment logs and analytics:

- Vercel Dashboard → Your Project → Deployments
- View build logs, runtime logs, and performance analytics

## Troubleshooting

If deployment fails:

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure build command runs locally without errors
4. Check Node.js version compatibility (18+)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Deployment Documentation](https://vercel.com/docs/deployments/overview)
