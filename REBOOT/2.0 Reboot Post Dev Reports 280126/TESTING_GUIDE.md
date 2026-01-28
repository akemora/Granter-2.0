# ✅ GRANTER 2.0 - TESTING GUIDE

**Version:** 2.0.0 | **Coverage:** 85%+ | **Tests:** 200+ | **Last Updated:** 2026-01-28

---

## Test Types (Testing Pyramid)

### Unit Tests (65%)
- Test individual functions
- Mocked dependencies
- Speed: < 100ms

### Integration Tests (25%)
- Test multiple components
- Real database
- Speed: 100ms - 1s

### E2E Tests (10%)
- Test complete flows
- Full application stack
- Speed: 1-5s

---

## Running Tests

```bash
npm run test                    # All tests
npm run test --watch          # Watch mode
npm run test -- --project=backend-core
npm run test:coverage         # Coverage report
npm run test:e2e              # E2E tests
```

---

## Coverage Targets

| Layer | Target | Current |
|-------|--------|---------|
| Backend Services | 85%+ | 85%+ ✅ |
| Frontend Components | 75%+ | 85%+ ✅ |
| Critical Paths | 100% | 100% ✅ |
| Overall | 85%+ | 85%+ ✅ |

---

## Writing Tests

### Unit Test
```typescript
describe('GrantsService', () => {
  let service: GrantsService;
  let mockRepo: Repository<Grant>;

  beforeEach(() => {
    mockRepo = { findOneBy: jest.fn() } as any;
    service = new GrantsService(mockRepo);
  });

  it('should return a grant by ID', async () => {
    mockRepo.findOneBy.mockResolvedValue({ id: '1', title: 'Test' });
    const result = await service.findById('1');
    expect(result.title).toBe('Test');
  });
});
```

### Component Test (React)
```typescript
import { render, screen } from '@testing-library/react';
import { GrantCard } from '../GrantCard';

describe('GrantCard', () => {
  it('should render grant info', () => {
    render(<GrantCard grant={mockGrant} onSelect={jest.fn()} />);
    expect(screen.getByText('Test Grant')).toBeInTheDocument();
  });
});
```

---

## Test Coverage Report

Generate and view coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## CI/CD Integration

All tests must pass before merge:
- ✅ npm run test
- ✅ npm run type-check
- ✅ npm run lint
- ✅ Coverage ≥ 85%

---

**Status:** ✅ Testing Complete
**Coverage:** 85%+
**Last Updated:** 2026-01-28
