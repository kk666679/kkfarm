# Contributing

Thank you for your interest in contributing to Smart Device Cloud! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

1. [How to Contribute](#how-to-contribute)
2. [Development Workflow](#development-workflow)
3. [Code Style](#code-style)
4. [Git Guidelines](#git-guidelines)
5. [Code Review](#code-review)
6. [Testing](#testing)
7. [Adding New Services or Packages](#adding-new-services-or-packages)
8. [Documentation](#documentation)

## How to Contribute

### Types of Contributions

- **Bug Reports**: File an issue describing the problem
- **Feature Requests**: Propose a new feature via issue
- **Code Contributions**: Submit pull requests for bugs, features, or improvements
- **Documentation**: Improve docs, add examples, fix typos
- **Tests**: Add test coverage for new or existing functionality

### Before You Start

1. Check existing issues to avoid duplicating effort
2. Comment on the issue to claim it (if one exists)
3. Discuss larger changes in the issue before coding
4. Fork the repository and create a feature branch

## Development Workflow

### Setting Up Your Environment

```bash
# Clone the repository
git clone <repository-url>
cd turbo

# Install root dependencies
npm install

# Install Smart Device Cloud dependencies
cd smart-device-cloud
npm install

# Create environment file
cp .env.example .env

# Start infrastructure
cd infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Verify everything works
npm run type-check
npm run test
```

### Branch Naming Convention

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/short-description` | `feature/device-heartbeat-timeout` |
| Bug Fix | `fix/short-description` | `fix/telemetry-buffer-overflow` |
| Release | `release/x.y.z` | `release/1.0.1` |
| Hotfix | `hotfix/short-description` | `hotfix/security-patch` |

### Making Changes

1. Create a branch from `develop`
2. Make your changes
3. Commit with descriptive messages (see Git Guidelines)
4. Push your branch
5. Open a Pull Request

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `ci` | CI configuration |
| `chore` | Maintenance |

**Examples:**

```
feat(device): add heartbeat timeout configuration
fix(api-gateway): handle connection pool exhaustion
docs(readme): update prerequisites section
refactor(shared): extract validation logic
```

## Code Style

### TypeScript

- Strict mode enabled (`strict: true`)
- `noUncheckedIndexedAccess: true`
- `isolatedModules: true`
- ES2022 target
- ESNext module system
- Bundler module resolution

### Formatting

Prettier is configured. Run before committing:

```bash
npm run format
```

### Linting

ESLint with TypeScript support:

```bash
npm run lint
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Packages | `@scope/kebab-case` | `@smartcloud/api-gateway` |
| Interfaces | PascalCase | `DeviceConfig` |
| Types | PascalCase | `WorkflowStatus` |
| Functions | camelCase | `getDeviceById` |
| Constants | UPPER_SNAKE_CASE | `HEARTBEAT_INTERVAL_MS` |
| Files | kebab-case | `device-schema.ts` |
| Variables | camelCase | `deviceId` |

### File Organization

```
package/
├── src/
│   ├── index.ts         # Public API exports
│   ├── config/          # Configuration
│   ├── schemas/         # Validation schemas
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── utils/           # Utility functions
│   └── tests/           # Tests
├── dist/                # Build output
├── package.json
└── tsconfig.json
```

## Git Guidelines

### Pull Request Process

1. Ensure your branch is up to date with `develop`
2. Run all checks: `npm run format && npm run lint && npm run type-check && npm run test`
3. Update documentation if needed
4. Add a descriptive PR title and description
5. Reference related issues
6. Request review from relevant team members
7. Address review feedback
8. Merge when approved

### PR Requirements

- [ ] Code follows project conventions
- [ ] Tests added/updated for new functionality
- [ ] All CI checks pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

### Commit Message Format

```
type(scope): description

Examples:
  feat(device): add device registration endpoint
  fix(api-gateway): resolve WebSocket reconnection issue
  docs(README): update installation instructions
```

## Code Review

### Review Checklist

Reviewers should check for:

- [ ] Code correctness and edge cases
- [ ] Proper error handling
- [ ] TypeScript type safety
- [ ] Test coverage adequacy
- [ ] Performance considerations
- [ ] Security implications
- [ ] Following project patterns and conventions
- [ ] Clean, readable code

### Review Etiquette

- Be constructive and respectful
- Focus on the code, not the person
- Suggest alternatives, not just point out problems
- Celebrate good work

## Testing

### Writing Tests

- Use Vitest for unit tests
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Test edge cases and error paths
- Use shared mocks from `@smart-device-cloud/shared`

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npx vitest run path/to/test.ts
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { componentUnderTest } from './index';

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle expected input', () => {
    // Arrange
    const input = { /* ... */ };

    // Act
    const result = componentUnderTest(input);

    // Assert
    expect(result).toMatchObject({ /* ... */ });
  });

  it('should throw on invalid input', async () => {
    await expect(componentUnderTest(null)).rejects.toThrow('Invalid input');
  });
});
```

## Adding New Services or Packages

### New Service

1. Create directory under `services/`
2. Add `package.json` with appropriate scripts
3. Add `tsconfig.json` extending base config
4. Add `src/index.ts` entry point
5. Add README.md
6. Add to turbo.json if needed
7. Add dependencies to root package.json if needed

### New Package

1. Create directory under `packages/`
2. Add `package.json` with `exports` field for subpath exports
3. Add `tsconfig.json`
4. Implement and export public API from `src/index.ts`
5. Add README.md with responsibilities and API docs
6. Add to workspace configuration

## Documentation

All significant changes should update relevant documentation:

- **README.md** for usage and overview changes
- **docs/ARCHITECTURE.md** for architecture changes
- **docs/API.md** for API changes
- **Inline comments** for complex logic

### Documentation Standards

- Use Markdown formatting consistently
- Include code examples for APIs
- Keep documentation in sync with code
- Use tables for structured data
- Link related documentation together

## Environment Requirements

### Local Development

- Node.js 24.21.0
- npm 12.0.2
- Docker (for infrastructure)

### CI/CD

- All PRs run: format check, lint, type-check, test
- Main branch requires passing checks
- Automated deployment on merge to main

---

*Last updated: 2026-09-20*