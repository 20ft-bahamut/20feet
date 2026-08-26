# Data Models

구현 기술은 G7 구조에 맞춰 결정하되 콘텐츠 모델은 아래 의미를 유지합니다.

# 1. PortfolioProject

```ts
type PortfolioCategory =
  | 'WEB'
  | 'COMMERCE'
  | 'SOFTWARE'
  | 'OPEN_SOURCE';

type PortfolioStatus =
  | 'BUILDING'
  | 'OPERATING'
  | 'RELEASED'
  | 'RESEARCH'
  | 'ARCHIVED';

interface PortfolioProject {
  id: string | number;
  slug: string;
  title: string;
  summary: string;
  categories: PortfolioCategory[];
  status?: PortfolioStatus;
  year: number;
  coverImage?: string;
  featured: boolean;
  visibility: 'public' | 'private';
  role?: string[];
  stack?: string[];
  overview?: string;
  context?: string;
  whatWeDid?: string[];
  system?: string;
  result?: string;
  screenshots?: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  links?: Array<{
    label: string;
    url: string;
  }>;
  sortOrder?: number;
  publishedAt?: string;
  updatedAt?: string;
}
```

# 2. SuperBifyProject

```ts
type SuperBifyType =
  | 'EXTENSION'
  | 'PLUGIN'
  | 'TOOL'
  | 'INTEGRATION'
  | 'EXPERIMENT';

type SuperBifyStatus =
  | 'IDEA'
  | 'RESEARCH'
  | 'BUILDING'
  | 'RELEASED'
  | 'MAINTENANCE'
  | 'ARCHIVED';

interface SuperBifyProject {
  id: string | number;
  slug: string;
  name: string;
  summary: string;
  type: SuperBifyType;
  target: string;
  status: SuperBifyStatus;
  version?: string;
  featured?: boolean;
  overview?: string;
  why?: string;
  features?: string[];
  requirements?: string[];
  installation?: string;
  usage?: string;
  githubUrl?: string;
  sirUrl?: string;
  docsUrl?: string;
  releaseUrl?: string;
  releasedAt?: string;
  updatedAt: string;
  changelog?: Array<{
    version: string;
    date?: string;
    changes: string[];
  }>;
}
```

# 3. ProjectInquiry

```ts
interface ProjectInquiry {
  projectType:
    | 'website'
    | 'commerce'
    | 'web-service'
    | 'gnuboard7'
    | 'system-improvement'
    | 'internal-system'
    | 'other';
  companyName?: string;
  name: string;
  email: string;
  phone?: string;
  currentUrl?: string;
  budgetRange?:
    | 'undecided'
    | 'under-3m'
    | '3m-5m'
    | '5m-10m'
    | '10m-30m'
    | 'over-30m'
    | 'discuss';
  desiredSchedule?: string;
  description: string;
  referenceUrl?: string;
  privacyConsent?: boolean;
}
```

# 4. Data Source Rule

Home에 Portfolio/SuperBify 항목을 별도 하드코딩하지 않습니다.

```text
Portfolio Source
  ├─ /portfolio
  └─ Home Selected Portfolio

SuperBify Source
  ├─ /superbify
  └─ Home SuperBify Preview
```

같은 데이터를 재사용합니다.

# 5. Publishing Rule

`visibility=private`는 public route에서 절대 노출하지 않습니다.

Draft/Idea를 공개할 때는 실제 상태를 그대로 보여줍니다.

없는 데이터에 placeholder fake value를 넣지 않습니다.
