# Selfy v3

Modern web application built with best practices and a focus on developer experience.

## Project Overview

Selfy v3 is developed using a phased sprint approach, ensuring quality and stability at each milestone.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier, Husky

## Project Structure

```
selfy-v3/
├── src/                    # Source code
├── .github/                # GitHub templates and workflows
├── .env.example            # Environment variables template
└── package.json            # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Website
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

### Development

```bash
npm run dev
```

### Code Quality

Run linting:

```bash
npm run lint
```

Run formatting:

```bash
npm run format
```

## Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

TBD
# Sprint 1 Complete
