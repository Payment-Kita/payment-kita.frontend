# Frontend Development Rules

> **Project:** payment-kita.frontend  
> **Architecture:** Clean Architecture + MVVM  
> **Framework:** Next.js 16+ (App Router)

---

## Directory Structure

```
src/
├── core/                  # Core utilities & configuration
│   ├── config/           # Environment configuration
│   ├── constant/         # API endpoints & routes
│   ├── network/          # HTTP client
│   └── utils/            # Helper functions (cn, formatters, etc.)
│
├── data/                  # Data Layer
│   ├── model/
│   │   ├── entity/       # Domain entities (User, Payment, Chain, etc.)
│   │   ├── request/      # Request DTOs (LoginRequest, CreatePaymentRequest)
│   │   └── response/     # Response DTOs (AuthResponse, PaymentsResponse)
│   ├── data_source/      # HTTP connectors (calls httpClient)
│   ├── repositories/
│   │   ├── repository/       # Interfaces
│   │   └── repository_impl/  # Implementations (uses DataSource)
│   └── usecase/          # React Query hooks
│
├── presentation/          # Presentation Layer
│   ├── components/
│   │   ├── atoms/        # Button, Input, Text, Icon
│   │   ├── molecules/    # Card, FormField, SearchBar
│   │   └── organisms/    # Header, Sidebar, PaymentForm
│   ├── providers/        # Context providers (Web3, Theme, Query)
│   └── view/             # CSR Views (receive initData from SSR)
│       ├── admin/
│       └── user/
│           └── [feature]/
│               ├── XxxView.tsx    # CSR View Component
│               └── useXxx.ts      # ViewModel Hook
│
└── app/                   # Next.js App Router (SSR Pages)
    ├── api/
    │   └── v1/
    │       └── [...path]/route.ts  # Proxy API (forwards to backend)
    ├── (auth)/            # Auth pages (SSR -> CSR View)
    ├── (dashboard)/       # Dashboard pages (SSR -> CSR View)
    └── pay/[id]/          # Public payment page
```

---

## Data Layer Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         USECASE                              │
│  (React Query hooks: usePaymentsQuery, useLoginMutation)    │
└───────────────────────────┬─────────────────────────────────┘
                            │ calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY_IMPL                           │
│  (PaymentRepositoryImpl, AuthRepositoryImpl)                │
└───────────────────────────┬─────────────────────────────────┘
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA_SOURCE                             │
│  (PaymentDataSource, AuthDataSource) - HTTP Connector       │
└───────────────────────────┬─────────────────────────────────┘
                            │ calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       HTTP_CLIENT                            │
│  (core/network/http_client.ts)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Core Layer Rules

### 1.1 Constants
- **All API endpoints** MUST be defined in `src/core/constant/api_endpoints.ts`
- **All routes** MUST be defined in `src/core/constant/routes.ts`
- Use dynamic functions for parameterized endpoints:
  ```typescript
  PAYMENT_BY_ID: (id: string) => `/v1/payments/${id}`,
  ```

### 1.2 HTTP Client
- Use `httpClient` from `src/core/network/http_client.ts` for all API calls
- **Only DataSource files call httpClient directly**
- Token management is handled by `httpClient.setAccessToken()`
- Base URL is `/api` (uses Proxy API route)

### 1.3 Environment
- All env vars MUST be accessed via `src/core/config/env.ts`
- Never use `process.env` directly in components
- **`API_BASE_URL`**: `/api` (client-side, uses proxy)
- **`BACKEND_URL`**: Direct backend URL (server-side only)

---

## 2. Proxy API

**Location:** `src/app/api/v1/[...path]/route.ts`

The Proxy API is a catch-all route handler that forwards all `/api/v1/*` requests to the backend server.

**Why Proxy?**
- Hide backend URL from client
- Handle CORS centrally
- Add server-side auth headers if needed
- Enable SSR data fetching

**Flow:**
```
Client → /api/v1/payments → Proxy Route → BACKEND_URL/v1/payments
```

---

## 2. Data Layer Rules

### 2.1 Model (Types/DTOs)
**Location:** `src/data/model/`

| Folder | Purpose | Example |
|--------|---------|---------|
| `entity/` | Domain entities | `User`, `Payment`, `Chain`, `Token` |
| `request/` | Request DTOs | `LoginRequest`, `CreatePaymentRequest` |
| `response/` | Response DTOs | `AuthResponse`, `PaymentsResponse` |

```typescript
// src/data/model/entity/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// src/data/model/request/index.ts
export interface LoginRequest {
  email: string;
  password: string;
}

// src/data/model/response/index.ts
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

### 2.2 Data Source (HTTP Connector)
**Location:** `src/data/data_source/`

- **Acts as HTTP connector** between Repository and httpClient
- Import `httpClient` from `@/core/network`
- Import `API_ENDPOINTS` from `@/core/constant`
- Import request/response types from `../model`
- Export singleton instances

```typescript
// src/data/data_source/auth_data_source.ts
import { httpClient } from '@/core/network';
import { API_ENDPOINTS } from '@/core/constant';
import type { LoginRequest } from '../model/request';
import type { AuthResponse } from '../model/response';

class AuthDataSource {
  async login(request: LoginRequest) {
    return httpClient.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, request);
  }
}

export const authDataSource = new AuthDataSource();
```

### 2.3 Repository Interface
**Location:** `src/data/repositories/repository/`

- Define contracts for data operations
- Import types from `../../model`
- Return `ApiResponse<T>` for all methods

```typescript
// src/data/repositories/repository/auth_repository.ts
import type { ApiResponse } from '@/core/network';
import type { LoginRequest } from '../../model/request';
import type { AuthResponse } from '../../model/response';

export interface IAuthRepository {
  login(input: LoginRequest): Promise<ApiResponse<AuthResponse>>;
}
```

### 2.4 Repository Implementation
**Location:** `src/data/repositories/repository_impl/`

- Implement interfaces
- **Use DataSource for HTTP operations** (NOT httpClient directly)
- Add business logic if needed (caching, token storage)
- Export singleton instances

```typescript
// src/data/repositories/repository_impl/auth_repository_impl.ts
import { authDataSource } from '../../data_source';
import type { IAuthRepository } from '../repository/auth_repository';
import type { LoginRequest } from '../../model/request';

class AuthRepositoryImpl implements IAuthRepository {
  async login(input: LoginRequest) {
    const response = await authDataSource.login(input);
    if (response.data) {
      // Store token, update state, etc.
    }
    return response;
  }
}

export const authRepository = new AuthRepositoryImpl();
```

### 2.5 Usecase (React Query)
**Location:** `src/data/usecase/`

- Wrap repository calls in React Query hooks
- Use `useQuery` for GET operations
- Use `useMutation` for POST/PUT/DELETE
- Invalidate queries on mutation success

```typescript
// src/data/usecase/auth_usecase.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '../repositories/repository_impl';
import type { LoginRequest } from '../model/request';

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginRequest) => authRepository.login(input),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData(['currentUser'], response.data.user);
      }
    },
  });
}
```

---

## 3. Presentation Layer Rules

### 3.1 Components (Atomic Design)
**Location:** `src/presentation/components/`

| Type | Description | Examples |
|------|-------------|----------|
| **atoms/** | Basic UI elements, no business logic | Button, Input, Text, Icon, Badge |
| **molecules/** | Combinations of atoms | Card, FormField, SearchBar, MenuItem |
| **organisms/** | Complex components with logic | Header, Sidebar, PaymentForm, DataTable |

**Rules:**
- Atoms should be pure presentational (no state)
- Molecules can have local state
- Organisms can use hooks but NOT usecases directly
- All components MUST have TypeScript props interface

```typescript
// src/presentation/components/atoms/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  // ...
}
```

### 3.2 Providers
**Location:** `src/presentation/providers/`

- Context providers for global state (Web3, Theme, etc.)
- Wrap in `QueryClientProvider` for React Query

### 3.3 View + ViewModel Pattern
**Location:** `src/presentation/view/[user|admin]/[feature]/`

Each CSR page MUST have:
1. **`XxxView.tsx`** – Pure UI component
2. **`useXxx.ts`** – ViewModel hook (state, handlers, usecases)

**ViewModel Hook Rules:**
- Call usecases (React Query hooks)
- Manage local state
- Handle side effects
- Return only what View needs

```typescript
// src/presentation/view/user/home/useHome.ts
'use client';

import { usePaymentsQuery } from '@/data/usecase';

export function useHome() {
  const { data, isLoading, error, refetch } = usePaymentsQuery();

  const handleRefresh = () => refetch();

  return {
    payments: data?.payments || [],
    isLoading,
    error: error?.message,
    handleRefresh,
  };
}
```

**View Component Rules:**
- Import ViewModel hook
- Focus on rendering UI
- NO direct usecase calls
- NO complex business logic

```typescript
// src/presentation/view/user/home/HomeView.tsx
'use client';

import { useHome } from './useHome';

export function HomeView() {
  const { payments, isLoading, handleRefresh } = useHome();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <Button onClick={handleRefresh}>Refresh</Button>
      <PaymentList payments={payments} />
    </div>
  );
}
```

---

## 4. Third-Party Library Integration

### 4.1 React Query (TanStack Query)
- **Provider:** Wrap app in `QueryClientProvider`
- **Location:** Usecases only (`src/data/usecase/`)
- **Keys:** Use descriptive arrays: `['payments', page, limit]`

### 4.2 Web3 / Wagmi / RainbowKit
- **Provider:** `src/presentation/providers/Web3Provider.tsx`
- **Hooks:** Use in ViewModel or organisms only
- **Chain config:** Define in provider file

### 4.3 Form Libraries (React Hook Form)
- Use in ViewModel hooks
- Return form methods to View
- Validate with Zod schemas

### 4.4 UI Libraries
- **TailwindCSS:** Use `cn()` from `@/core/utils` for class merging
- **Radix/Shadcn:** Place in `components/atoms/` or `molecules/`

---

## 5. Path Aliases

| Alias | Path |
|-------|------|
| `@/*` | `./*` |
| `@/core/*` | `./src/core/*` |
| `@/data/*` | `./src/data/*` |
| `@/presentation/*` | `./src/presentation/*` |

---

## 6. File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `Button.tsx`, `PaymentCard.tsx` |
| Hook | camelCase with `use` prefix | `useHome.ts`, `usePayments.ts` |
| Model | snake_case in folder | `entity/index.ts`, `request/index.ts` |
| Data source | snake_case | `auth_data_source.ts` |
| Repository | snake_case | `auth_repository.ts`, `auth_repository_impl.ts` |
| Usecase | snake_case | `auth_usecase.ts` |

---

## 7. Creating a New Feature Checklist

### Step 1: Model (if new entities)
1. Add entity types in `src/data/model/entity/index.ts`
2. Add request DTOs in `src/data/model/request/index.ts`
3. Add response DTOs in `src/data/model/response/index.ts`

### Step 2: API Endpoint
4. Add endpoint to `src/core/constant/api_endpoints.ts`

### Step 3: Data Source
5. Create/update data source in `src/data/data_source/xxx_data_source.ts`
6. Export from `src/data/data_source/index.ts`

### Step 4: Repository
7. Create interface in `src/data/repositories/repository/xxx_repository.ts`
8. Create implementation in `src/data/repositories/repository_impl/xxx_repository_impl.ts`
9. Export from respective index files

### Step 5: Usecase
10. Create React Query hooks in `src/data/usecase/xxx_usecase.ts`
11. Export from `src/data/usecase/index.ts`

### Step 6: Presentation
12. Add route to `src/core/constant/routes.ts`
13. Create ViewModel hook in `src/presentation/view/[user|admin]/[feature]/useXxx.ts`
14. Create View component in `src/presentation/view/[user|admin]/[feature]/XxxView.tsx`

### Step 7: App Router
15. Create page route in `app/[route]/page.tsx` (import View)

---

## 8. Import Order

```typescript
// 1. React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';

// 3. Core
import { API_ENDPOINTS, ROUTES } from '@/core/constant';
import { httpClient } from '@/core/network';

// 4. Data
import { usePaymentsQuery } from '@/data/usecase';
import type { Payment } from '@/data/model';

// 5. Presentation
import { Button } from '@/presentation/components/atoms';
import { PaymentCard } from '@/presentation/components/molecules';

// 6. Relative
import { useHome } from './useHome';
```

## 9. AI Generation Rules (Strict)

When generating code for a new feature, you MUST follow this sequence:

1.  **Define Domain First:** Create `entity/index.ts` and `request/response` DTOs.
2.  **Contract Definition:** Create the `Repository` interface.
3.  **Implementation:** Create `DataSource` and `RepositoryImpl`.
4.  **Logic:** Create `UseCase` (React Query hook for Client, or pure Async Function for Server).
5.  **UI:** Only AFTER step 4 is complete, create `ViewModel` and `View`.

**Prohibition:**
- NEVER put business logic inside `View` or `app/page.tsx`.
- NEVER skip creating an Interface for the Repository.

## 10. Error Handling Standard
- Semua error dari httpClient harus dikonversi ke `AppError` class
- View hanya menerima `error?: string` (bukan AxiosError/Error object)

## 11. SSR Data Fetching
- Server Components hanya boleh panggil Repository (bukan UseCase/React Query)
- Gunakan `BACKEND_URL` (bukan `/api`) untuk server-side calls

## 12. Security
- Token storage: Hanya di memory (bukan localStorage) untuk hindari XSS
- CSRF protection untuk proxy API route