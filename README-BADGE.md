# CI Status Badge

Add this to your README.md:

## Markdown Format
```markdown
[![Contract Tests (Isolated CI)](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml/badge.svg)](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml)
```

## HTML Format (with link)
```html
<a href="https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml">
  <img src="https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml/badge.svg" alt="Contract Tests (Isolated CI)">
</a>
```

## Badge for specific branch (ci/re-enable)
```markdown
[![Contract Tests](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml/badge.svg?branch=ci/re-enable)](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml)
```

## Badge for main branch (after merge)
```markdown
[![Contract Tests](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml/badge.svg?branch=main)](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml)
```

## Multiple Badges (recommended)
```markdown
[![Contract Tests](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml/badge.svg)](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-85.5%25-brightgreen)](https://github.com/raeisisep-star/Titan/pull/22)
```

## Preview

When CI is green, it will look like:
![Contract Tests (Isolated CI)](https://img.shields.io/badge/Contract%20Tests%20(Isolated%20CI)-passing-brightgreen)

## Suggested README Section

```markdown
# Titan Trading Platform

[![Contract Tests](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml/badge.svg)](https://github.com/raeisisep-star/Titan/actions/workflows/ci-contracts.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-85.5%25-brightgreen)](https://github.com/raeisisep-star/Titan)

Advanced AI-powered trading platform with automated contract testing.

## Testing

- **Contract Tests**: 59/69 passing (85.5%)
- **CI/CD**: Automated testing on every PR
- **Coverage**: Full test coverage reports available as artifacts

## CI/CD

Our CI runs isolated tests with:
- Ephemeral PostgreSQL 15 and Redis 7
- Zero connection to production
- Path-based triggers for efficient testing
- Coverage reports and server logs as artifacts
```
