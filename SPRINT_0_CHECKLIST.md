# Sprint 0 — Kickoff & Repo + Infra Basics

## Purpose

Project hygiene and reproducible repo.

## Status: READY FOR REVIEW

---

## Tasks Completed

### 1. GitHub Repo Setup ✓

- [x] Git repository initialized
- [x] `main` branch created
- [x] `develop` branch created
- [x] Branch strategy documented in CONTRIBUTING.md
- [ ] **Manual Step Required**: Push to GitHub and set up branch protection rules
  - Protect `main` branch (require PR reviews, status checks)
  - Protect `develop` branch (require PR reviews)

### 2. Documentation ✓

- [x] README.md created with project overview
- [x] CONTRIBUTING.md with workflow guidelines
- [x] Pull request template (.github/PULL_REQUEST_TEMPLATE/)
- [x] VERCEL_SETUP.md with deployment instructions

### 3. Repository Structure ✓

- [x] Single repo with clear `src/` layout
- [x] Project directory structure created
- [x] src/index.ts placeholder file

### 4. Code Quality Tools ✓

- [x] TypeScript configuration (tsconfig.json)
  - Strict mode enabled
  - Path aliases configured (@/\*)
  - Modern ES2022 target
- [x] ESLint configuration (eslint.config.js)
  - TypeScript support
  - Recommended rules
  - No explicit any allowed
- [x] Prettier configuration (.prettierrc)
  - Consistent code formatting
  - .prettierignore for exclusions
- [x] .editorconfig for editor consistency
- [x] Husky pre-commit hooks (.husky/pre-commit)
  - Type checking
  - Linting
  - Format checking

### 5. Environment & Deployment ✓

- [x] .env.example with required variable names
- [x] .gitignore configured
- [x] vercel.json configuration
- [x] Vercel setup documentation
- [ ] **Manual Step Required**: Link repository to Vercel
  - Create Vercel project
  - Configure production (main) and staging (develop) environments
  - Add environment variables from .env.example

### 6. Package Configuration ✓

- [x] package.json created
- [x] Scripts defined:
  - `npm run lint` - Run ESLint
  - `npm run lint:fix` - Auto-fix lint issues
  - `npm run format` - Format code with Prettier
  - `npm run format:check` - Check formatting
  - `npm run type-check` - TypeScript type checking
  - `npm run prepare` - Initialize Husky
- [ ] **Manual Step Required**: Install dependencies (waiting for your approval)

---

## Checkpoint Status

- [x] `develop` branch created
- [ ] Lint/format scripts ready (requires `npm install` first)
- [x] All configuration files in place

---

## Acceptance Criteria

- [x] Repo is ready to accept code
- [x] PR template created
- [ ] Branch protection rules set (manual GitHub setup required)
- [ ] Dependencies installed (awaiting approval)

---

## Next Steps to Complete Sprint 0

### Required Manual Actions:

1. **Install Dependencies**:

   ```bash
   cd /Users/samsantos/Documents/Selfy/Website
   npm install typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint prettier husky --save-dev
   npm install
   npm run prepare  # Initialize Husky
   ```

2. **Create GitHub Repository**:

   ```bash
   # On GitHub, create a new repository named "selfy-v3" or similar
   # Then push this repository:
   git add .
   git commit -m "chore: Sprint 0 - Initial project setup"
   git push -u origin develop
   git checkout main
   git merge develop
   git push -u origin main
   git checkout develop
   ```

3. **Configure GitHub Branch Protection**:
   - Go to repository Settings → Branches
   - Add protection rule for `main`:
     - Require pull request reviews before merging
     - Require status checks to pass
     - Include administrators
   - Add protection rule for `develop`:
     - Require pull request reviews before merging

4. **Setup Vercel**:
   - Follow instructions in VERCEL_SETUP.md
   - Link GitHub repository
   - Configure environment variables
   - Enable deployments for `main` (production) and `develop` (staging)

5. **Verify Everything Works**:
   ```bash
   npm run type-check  # Should pass
   npm run lint        # Should pass
   npm run format:check # Should pass
   ```

---

## Project Structure

```
selfy-v3/
├── .github/
│   ├── PULL_REQUEST_TEMPLATE/
│   │   └── pull_request_template.md
│   └── workflows/                    # (Future CI/CD workflows)
├── .husky/
│   └── pre-commit                    # Pre-commit hooks
├── src/
│   └── index.ts                      # Entry point placeholder
├── .editorconfig                     # Editor configuration
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── .prettierignore                   # Prettier ignore rules
├── .prettierrc                       # Prettier configuration
├── CONTRIBUTING.md                   # Contribution guidelines
├── README.md                         # Project overview
├── SPRINT_0_CHECKLIST.md            # This file
├── VERCEL_SETUP.md                  # Vercel deployment guide
├── eslint.config.js                 # ESLint configuration
├── package.json                      # Project manifest
├── tsconfig.json                     # TypeScript configuration
└── vercel.json                       # Vercel deployment config
```

---

## Notes

- No packages have been installed yet (as requested)
- All configuration files are in place and ready
- Once dependencies are installed, all lint/format scripts will be functional
- Husky hooks will activate after running `npm run prepare`
