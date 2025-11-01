# 🤝 Contributing to Titan Trading Platform

Thank you for your interest in contributing to the Titan Trading Platform! This document outlines the contribution process and guidelines.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing Guidelines](#testing-guidelines)

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Welcome newcomers and help them learn
- Report unacceptable behavior to project maintainers

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15+
- Redis 7+
- Git
- npm (or yarn/pnpm)

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/raeisisep-star/Titan.git
cd Titan

# Install dependencies
npm ci

# Copy environment template
cp .env.example .env

# Configure environment variables
vi .env

# Run locally
npm run dev
```

---

## Development Workflow

### 1. Create Feature Branch

Always create a new branch for your work:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

**Examples:**
- `feature/add-binance-integration`
- `fix/database-connection-pool`
- `docs/update-api-documentation`
- `chore/upgrade-dependencies`

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass locally

### 3. Test Locally

```bash
# Lint code
npm run lint

# Run tests
npm test

# Build project
npm run build

# Start dev server
npm run dev
```

### 4. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add Binance WebSocket integration"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
gh pr create --fill
```

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Test additions/updates
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes

### Scope (optional)

The scope specifies what part of the codebase is affected:

- `api` - API endpoints
- `db` - Database
- `auth` - Authentication
- `ci` - CI/CD
- `docs` - Documentation
- `deps` - Dependencies

### Examples

```bash
feat(api): add /api/orders endpoint

- Implement order creation
- Add validation middleware
- Update API documentation

Closes #123
```

```bash
fix(db): resolve connection pool exhaustion

- Increase pool size to 20
- Add connection timeout of 30s
- Log connection metrics

Fixes #456
```

```bash
docs(readme): update installation instructions

- Add Node.js version requirement
- Include PostgreSQL setup steps
- Add troubleshooting section
```

---

## Pull Request Process

### Before Creating PR

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with `main`

### PR Title Format

PR titles should follow commit message format:

```
feat: add Binance WebSocket integration
fix: resolve database connection pool issue
docs: update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
Describe testing performed:
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] Tested on staging environment

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Closes #123
Fixes #456
Relates to #789

## Screenshots (if applicable)
Add screenshots here
```

### Review Process

1. **Automated Checks**: CI must pass (Build, Lint, Test, E2E)
2. **Code Review**: At least 1 approval from code owner
3. **Testing**: Changes tested on staging
4. **Approval**: Reviewer approves PR
5. **Merge**: Squash and merge to main

### Merge Requirements

- ✅ All CI checks passing
- ✅ At least 1 approval
- ✅ No merge conflicts
- ✅ Branch up-to-date with main
- ✅ All conversations resolved

---

## Code Style

### General Guidelines

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons** at end of statements
- Keep lines under **100 characters**
- Use **meaningful variable names**
- Add **comments** for complex logic
- Follow **DRY principle** (Don't Repeat Yourself)

### JavaScript/TypeScript

```javascript
// Good
const getUserById = async (userId) => {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return user;
};

// Bad
const getUser = async (id) => {
  const x = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return x;
};
```

### Naming Conventions

- **Variables/Functions**: camelCase (`getUserData`, `isValid`)
- **Constants**: UPPER_SNAKE_CASE (`API_KEY`, `MAX_RETRIES`)
- **Classes**: PascalCase (`UserService`, `DatabaseConnection`)
- **Files**: kebab-case (`user-service.js`, `database-config.js`)

---

## Testing Guidelines

### Test Structure

```javascript
describe('User Service', () => {
  describe('getUserById', () => {
    it('should return user when valid ID provided', async () => {
      const user = await getUserById(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('should return null when invalid ID provided', async () => {
      const user = await getUserById(999);
      expect(user).toBeNull();
    });
  });
});
```

### Test Coverage

- Aim for **>80% code coverage**
- Write tests for:
  - All new features
  - Bug fixes
  - Critical paths
  - Edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test user.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Additional Resources

- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

## Questions?

If you have questions about contributing, please:

1. Check existing documentation
2. Search closed issues/PRs
3. Ask in pull request discussions
4. Contact @raeisisep-star

---

**Thank you for contributing to Titan Trading Platform! 🚀**

**Last Updated**: 2025-11-01  
**Maintained By**: @raeisisep-star
