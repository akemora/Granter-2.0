# SearchService Usage Examples

Comprehensive examples and use cases for the SearchService API.

## Table of Contents

1. [Basic Queries](#basic-queries)
2. [Full-Text Search](#full-text-search)
3. [Filtering](#filtering)
4. [Pagination](#pagination)
5. [Complex Combinations](#complex-combinations)
6. [Frontend Integration](#frontend-integration)
7. [Error Handling](#error-handling)
8. [Performance Tips](#performance-tips)

## Basic Queries

### Get All Grants

**HTTP Request:**
```bash
curl -X GET "http://localhost:3000/search" \
  -H "Content-Type: application/json"
```

**JavaScript:**
```typescript
const response = await fetch('http://localhost:3000/search');
const results = await response.json();
console.log(results);
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Research Funding Program",
      "description": "Support for innovative research projects",
      "amount": 50000,
      "deadline": "2024-12-31T00:00:00.000Z",
      "region": "ES",
      "source": {
        "id": "source-1",
        "name": "Spanish Science Foundation",
        "url": "https://ciencia.gob.es",
        "region": "ES",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 250,
  "skip": 0,
  "take": 20,
  "currentPage": 1,
  "totalPages": 13
}
```

### Get Single Grant

While SearchService handles bulk searches, use the GrantsController for single grants:

```bash
curl -X GET "http://localhost:3000/grants/550e8400-e29b-41d4-a716-446655440000"
```

## Full-Text Search

### Simple Search Term

**Find grants about "research":**

```bash
curl -X GET "http://localhost:3000/search?query=research"
```

**JavaScript:**
```typescript
const response = await fetch('http://localhost:3000/search?query=research');
const { data, total } = await response.json();
console.log(`Found ${total} grants mentioning "research"`);
data.forEach(grant => {
  console.log(`- ${grant.title}: ${grant.amount}`);
});
```

### Multi-Word Search

**Find grants about "European innovation":**

```bash
curl -X GET "http://localhost:3000/search?query=European+innovation"
```

The search is case-insensitive and matches word stems:
- "research" matches "research", "researcher", "researching"
- "fund" matches "fund", "funding", "funded"

### Search with Special Characters

PostgreSQL safely handles special characters, but stick to alphanumeric + spaces:

```bash
# Good
curl -X GET "http://localhost:3000/search?query=research%20innovation"

# Special characters get normalized
curl -X GET "http://localhost:3000/search?query=R%26D"  # 'R&D' -> normalized
```

## Filtering

### Filter by Single Region

**Find grants in Spain:**

```bash
curl -X GET "http://localhost:3000/search?regions=ES"
```

### Filter by Multiple Regions

**Find grants in Spain or EU:**

```bash
curl -X GET "http://localhost:3000/search?regions=ES&regions=EU"
```

**JavaScript:**
```typescript
const params = new URLSearchParams();
params.append('regions', 'ES');
params.append('regions', 'EU');

const response = await fetch(`http://localhost:3000/search?${params}`);
const results = await response.json();
```

### Filter by Amount Range

**Find grants between 5,000 and 100,000:**

```bash
curl -X GET "http://localhost:3000/search?minAmount=5000&maxAmount=100000"
```

**JavaScript:**
```typescript
const response = await fetch(
  'http://localhost:3000/search?minAmount=5000&maxAmount=100000'
);
const { data } = await response.json();
data.forEach(grant => {
  console.log(`${grant.title}: €${grant.amount.toLocaleString('es-ES')}`);
});
```

### Filter by Deadline Range

**Find grants with deadline between June and December 2024:**

```bash
curl -X GET "http://localhost:3000/search?deadlineAfter=2024-06-01&deadlineBefore=2024-12-31"
```

**JavaScript:**
```typescript
const now = new Date();
const sixMonthsAhead = new Date();
sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

const params = new URLSearchParams({
  deadlineAfter: now.toISOString().split('T')[0],
  deadlineBefore: sixMonthsAhead.toISOString().split('T')[0]
});

const response = await fetch(`http://localhost:3000/search?${params}`);
const { data } = await response.json();
```

## Pagination

### Default Pagination

Returns first 20 results:

```bash
curl -X GET "http://localhost:3000/search"
```

### Get Second Page

20 items per page, skip first 20 (page 2):

```bash
curl -X GET "http://localhost:3000/search?skip=20&take=20"
```

**JavaScript:**
```typescript
const page = 2;
const itemsPerPage = 20;
const skip = (page - 1) * itemsPerPage;

const response = await fetch(
  `http://localhost:3000/search?skip=${skip}&take=${itemsPerPage}`
);
const { data, currentPage, totalPages } = await response.json();
console.log(`Page ${currentPage} of ${totalPages}`);
```

### Larger Page Sizes

Maximum 100 items per page (enforced):

```bash
# Request 50 items
curl -X GET "http://localhost:3000/search?skip=0&take=50"

# Request 200 items (capped to 100)
curl -X GET "http://localhost:3000/search?skip=0&take=200"  # Returns 100
```

### Pagination Calculation Helper

```typescript
function calculatePagination(totalItems: number, itemsPerPage: number) {
  return {
    totalPages: Math.ceil(totalItems / itemsPerPage),
    goToPage: (pageNumber: number) => ({
      skip: (pageNumber - 1) * itemsPerPage,
      take: itemsPerPage
    })
  };
}

// Usage
const { totalPages, goToPage } = calculatePagination(250, 20);
const page3Params = goToPage(3);  // { skip: 40, take: 20 }
```

## Complex Combinations

### Research Funding in Spain and EU, 10k-50k, deadline by EOY

**HTTP:**
```bash
curl -X GET "http://localhost:3000/search?query=research&regions=ES&regions=EU&minAmount=10000&maxAmount=50000&deadlineBefore=2024-12-31"
```

**JavaScript:**
```typescript
async function findResearchFunding() {
  const params = new URLSearchParams({
    query: 'research',
    minAmount: '10000',
    maxAmount: '50000',
    deadlineBefore: '2024-12-31'
  });
  params.append('regions', 'ES');
  params.append('regions', 'EU');

  const response = await fetch(`http://localhost:3000/search?${params}`);
  const { data, total } = await response.json();

  return {
    grants: data,
    totalMatches: total,
    averageAmount: data.reduce((sum, g) => sum + g.amount, 0) / data.length
  };
}

const results = await findResearchFunding();
console.log(`Found ${results.totalMatches} research grants`);
console.log(`Average amount: €${results.averageAmount.toFixed(2)}`);
```

### Large Grants in International Programs

**Find international grants over 100,000:**

```bash
curl -X GET "http://localhost:3000/search?regions=INT&minAmount=100000"
```

**JavaScript:**
```typescript
const response = await fetch(
  'http://localhost:3000/search?regions=INT&minAmount=100000&take=50'
);
const { data } = await response.json();

data.sort((a, b) => b.amount - a.amount);
console.log('Top International Grants:');
data.slice(0, 5).forEach((grant, idx) => {
  console.log(`${idx + 1}. ${grant.title}: €${grant.amount}`);
});
```

### Expiring Soon with Specific Budget

**Find grants expiring in next 30 days, 20k-30k:**

```typescript
async function findExpiringGrants() {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const params = new URLSearchParams({
    minAmount: '20000',
    maxAmount: '30000',
    deadlineBefore: thirtyDaysFromNow.toISOString().split('T')[0]
  });

  const response = await fetch(`http://localhost:3000/search?${params}`);
  const { data } = await response.json();

  return data.sort((a, b) =>
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
}
```

## Frontend Integration

### React Component Example

```typescript
import { useState, useEffect } from 'react';

interface Grant {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  region: string;
}

interface SearchState {
  grants: Grant[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error?: string;
}

export function GrantsSearch() {
  const [state, setState] = useState<SearchState>({
    grants: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false
  });

  const [filters, setFilters] = useState({
    query: '',
    regions: ['ES', 'EU'],
    minAmount: 5000,
    maxAmount: 100000
  });

  const search = async (page = 1) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const skip = (page - 1) * 20;
      const params = new URLSearchParams({
        skip: skip.toString(),
        take: '20',
        query: filters.query,
        minAmount: filters.minAmount.toString(),
        maxAmount: filters.maxAmount.toString()
      });

      filters.regions.forEach(r => params.append('regions', r));

      const response = await fetch(
        `http://localhost:3000/search?${params}`
      );
      const data = await response.json();

      setState({
        grants: data.data,
        total: data.total,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        loading: false
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch grants'
      }));
    }
  };

  useEffect(() => {
    search(1);
  }, [filters]);

  return (
    <div className="grants-search">
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.query}
          onChange={e => setFilters({ ...filters, query: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min amount"
          value={filters.minAmount}
          onChange={e => setFilters({ ...filters, minAmount: Number(e.target.value) })}
        />
      </div>

      {state.loading && <div>Loading...</div>}
      {state.error && <div className="error">{state.error}</div>}

      <div className="results">
        <div>Found {state.total} grants</div>
        {state.grants.map(grant => (
          <div key={grant.id} className="grant-card">
            <h3>{grant.title}</h3>
            <p>€{grant.amount.toLocaleString()}</p>
            <p>Deadline: {new Date(grant.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => search(state.currentPage - 1)}
          disabled={state.currentPage === 1}
        >
          Previous
        </button>
        <span>Page {state.currentPage} of {state.totalPages}</span>
        <button
          onClick={() => search(state.currentPage + 1)}
          disabled={state.currentPage === state.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Vue Component Example

```vue
<template>
  <div class="grants-search">
    <div class="filters">
      <input
        v-model="filters.query"
        placeholder="Search grants..."
        @input="debounceSearch"
      />
      <input
        v-model.number="filters.minAmount"
        type="number"
        placeholder="Min amount"
      />
      <input
        v-model.number="filters.maxAmount"
        type="number"
        placeholder="Max amount"
      />
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="results">
      <div>Found {{ total }} grants</div>
      <div v-for="grant in grants" :key="grant.id" class="grant-card">
        <h3>{{ grant.title }}</h3>
        <p>€{{ grant.amount.toLocaleString() }}</p>
        <p>Deadline: {{ formatDate(grant.deadline) }}</p>
      </div>
    </div>

    <div class="pagination">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const filters = ref({
  query: '',
  regions: ['ES', 'EU'],
  minAmount: 5000,
  maxAmount: 100000
});

const grants = ref([]);
const total = ref(0);
const currentPage = ref(1);
const totalPages = ref(0);
const loading = ref(false);
const error = ref('');
let searchTimeout: NodeJS.Timeout;

const search = async (page = 1) => {
  loading.value = true;
  try {
    const skip = (page - 1) * 20;
    const params = new URLSearchParams({
      skip: skip.toString(),
      take: '20',
      query: filters.value.query,
      minAmount: filters.value.minAmount.toString(),
      maxAmount: filters.value.maxAmount.toString()
    });

    filters.value.regions.forEach(r => params.append('regions', r));

    const response = await fetch(`/api/search?${params}`);
    const data = await response.json();

    grants.value = data.data;
    total.value = data.total;
    currentPage.value = data.currentPage;
    totalPages.value = data.totalPages;
  } catch (e) {
    error.value = 'Failed to fetch grants';
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => search(1), 300);
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    search(page);
  }
};

watch(() => filters.value.minAmount, () => search(1));
watch(() => filters.value.maxAmount, () => search(1));

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString();
</script>
```

## Error Handling

### Handling Common Errors

```typescript
async function handleSearchError(response: Response) {
  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 400:
        console.error('Invalid request:', error.message);
        // Handle validation errors
        if (error.message.includes('Skip parameter')) {
          // Fix: ensure skip >= 0
        } else if (error.message.includes('Take parameter')) {
          // Fix: ensure 0 < take <= 100
        } else if (error.message.includes('amount')) {
          // Fix: amount validation
        }
        break;
      case 500:
        console.error('Server error:', error);
        // Retry or show user-friendly message
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}

// Usage
try {
  const response = await fetch('http://localhost:3000/search?skip=-1');
  await handleSearchError(response);
} catch (error) {
  console.error('Network error:', error);
}
```

## Performance Tips

### Caching Search Results

```typescript
const searchCache = new Map<string, any>();

async function cachedSearch(query: string) {
  const cacheKey = JSON.stringify(query);

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const params = new URLSearchParams(query);
  const response = await fetch(`/search?${params}`);
  const data = await response.json();

  searchCache.set(cacheKey, data);

  // Invalidate cache after 5 minutes
  setTimeout(() => searchCache.delete(cacheKey), 5 * 60 * 1000);

  return data;
}
```

### Debouncing Search Input

```typescript
function createDebouncedSearch(delay = 300) {
  let timeout: NodeJS.Timeout;

  return (query: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
      const results = await response.json();
      console.log(results);
    }, delay);
  };
}

const debouncedSearch = createDebouncedSearch();
inputElement.addEventListener('input', e => {
  debouncedSearch((e.target as HTMLInputElement).value);
});
```

### Optimized Pagination

```typescript
// Only fetch when actually needed
async function prefetchPage(pageNumber: number) {
  const skip = (pageNumber - 1) * 20;
  return fetch(`/search?skip=${skip}&take=20`);
}

// Lazy load next page on scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    prefetchPage(currentPage + 1);
  }
});
```
