# Contributing to Selfy v3

Thank you for considering contributing to Selfy v3! This document outlines the process and guidelines for contributing.

## Development Workflow

### Branch Strategy

We follow a structured branching model:

- **`main`** - Production-ready code. Direct commits are prohibited.
- **`develop`** - Integration branch. All features merge here first.
- **`feature/*`** - Feature branches. Branch from `develop`, merge back to `develop`.

### Getting Started

1. Ensure you have the latest `develop` branch:

```bash
git checkout develop
git pull origin develop
```

2. Create a new feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes following our code standards (see below)

4. Commit your changes with clear, descriptive messages:

```bash
git add .
git commit -m "feat: add user authentication"
```

### Commit Message Guidelines

Follow conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Standards

#### TypeScript

- Use TypeScript for all new code
- Avoid `any` types; use proper typing
- Enable strict mode

#### Code Style

- Run `npm run format` before committing (enforced by Husky)
- Run `npm run lint` to check for issues
- Follow existing code patterns in the project

#### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for meaningful test coverage

### Pull Request Process

1. Update your feature branch with the latest `develop`:

```bash
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git merge develop
```

2. Push your branch:

```bash
git push origin feature/your-feature-name
```

3. Open a Pull Request on GitHub:
   - Use the PR template
   - Fill in all sections completely
   - Link any related issues
   - Request reviews from team members

4. Address review feedback:
   - Make requested changes
   - Push updates to the same branch
   - Re-request review when ready

5. After approval:
   - Squash and merge into `develop`
   - Delete the feature branch

### Code Review Guidelines

When reviewing PRs:

- Be constructive and respectful
- Check for code quality, not just functionality
- Verify tests are included and passing
- Ensure documentation is updated if needed

### Pre-commit Hooks

Husky runs the following checks before each commit:

- ESLint
- Prettier formatting
- TypeScript compilation (if applicable)

If any checks fail, the commit will be blocked. Fix the issues and try again.

## Questions?

If you have questions about contributing, please open an issue for discussion.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
