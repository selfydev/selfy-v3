# Selfy v3

Modern web application built with best practices and a focus on developer experience.

## Project Overview

Selfy v3 is developed using a phased sprint approach, ensuring quality and stability at each milestone.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **UI Library**: Custom component library with design tokens
- **Runtime**: Node.js 18+
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier, Husky

## Project Structure

```
selfy-v3/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard route group
│   │   ├── components-demo/    # UI components demo page
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Icon.tsx
│   │   ├── marketing/          # Marketing layout components
│   │   ├── dashboard/          # Dashboard layout components
│   │   └── transitions/        # Page transition components
│   ├── design/
│   │   └── tokens.ts           # Design system tokens
│   └── providers/
│       └── ThemeProvider.tsx   # Theme context provider
├── .github/                    # GitHub templates and workflows
├── .env.example                # Environment variables template
└── package.json                # Project dependencies
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

## Features

### Sprint 0 - Foundation ✅

- GitHub repository with branch protection
- TypeScript, ESLint, Prettier, Husky configuration
- Vercel deployment setup
- Comprehensive documentation

### Sprint 1 - Next.js + Tailwind + Design Tokens ✅

- Next.js 16 with App Router
- Tailwind CSS 4 with design tokens
- Marketing and Dashboard layouts
- Responsive homepage and dashboard pages

### Sprint 2 - UI Component Library ✅

- **Button**: Multiple variants (primary, secondary, outline, ghost, danger), sizes, loading state
- **Input**: Labels, icons, validation, error states
- **Card**: Multiple variants (default, elevated, outlined), hoverable animations
- **Modal**: Accessible dialogs with escape key, overlay click, body scroll lock
- **Toast**: Contextual notifications (success, error, warning, info) with auto-dismiss
- **Icon**: 30+ icons with multiple sizes
- **ThemeProvider**: Centralized theme management
- **PageTransition**: Framer Motion page transitions
- **Demo Page**: Comprehensive showcase at `/components-demo`

## UI Components

All components are available at `/components-demo` with interactive examples.

Import components from `@/components/ui`:

```tsx
import { Button, Input, Card, Modal, useToast } from '@/components/ui';

// Button usage
<Button variant="primary" size="md">Click me</Button>

// Input with validation
<Input
  label="Email"
  type="email"
  error={error}
  leftIcon={<Icon name="mail" />}
/>

// Card with hover effect
<Card variant="elevated" hoverable>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>

// Toast notifications
const { success, error } = useToast();
success('Operation completed!');
```

## Design Tokens

All components use centralized design tokens from `src/design/tokens.ts`:

- **Colors**: Primary, secondary, neutral, semantic (success, error, warning, info)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Effects**: Border radius, shadows, transitions

## License

TBD
