# UI Testing Guide

## Overview

This project uses **Vitest** + **React Testing Library** for UI testing.

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/
├── __tests__/
│   ├── Button.test.tsx       # Component tests
│   ├── Card.test.tsx         # Component tests
│   ├── JobCardTable.test.tsx # Feature tests
│   └── StatCard.test.tsx     # Component tests
├── components/
│   └── ... (components being tested)
└── vitest.setup.ts           # Test configuration
```

## Writing Tests

### Basic Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/shared/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Testing with Router

```tsx
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <MyComponent />
  </BrowserRouter>
);
```

### Testing Async Operations

```tsx
import { waitFor } from '@testing-library/react';

it('loads data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeDefined();
  });
});
```

## Best Practices

1. **Test behavior, not implementation** - Test what users see and do
2. **Use `screen` queries** - Prefer `getByRole`, `getByText` over test IDs
3. **Mock external dependencies** - Use `vi.fn()` for API calls
4. **Test accessibility** - Use `getByRole` to ensure ARIA labels work

## Coverage

Current test coverage:
- ✅ Button component
- ✅ Card component
- ✅ JobCardTable component
- ✅ StatCard component

Run `npm run test:coverage` to see full report.

## CI Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request

See `.github/workflows/ci.yml` for configuration.
