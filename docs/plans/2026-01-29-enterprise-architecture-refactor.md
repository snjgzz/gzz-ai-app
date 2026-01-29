# 企业级架构重构设计方案

**日期**: 2026-01-29
**版本**: 1.0
**作者**: AI Assistant

---

## 一、现状分析

### 1.1 当前结构评估

**评分**: 7/10（接近企业级，但有改进空间）

**优点**:
- ✅ 清晰的目录划分（app、components、hooks、lib 等）
- ✅ 良好的关注点分离（UI 组件 vs 业务组件）
- ✅ 第三方库封装规范（crypto、auth、api）
- ✅ 配置和常量独立管理
- ✅ Prisma ORM 规范使用

**缺失的关键元素**:
- ❌ `src/types/` - TypeScript 类型集中管理
- ❌ `src/services/` - 业务逻辑层（当前逻辑散落在 components 和 lib）
- ❌ `src/store/` - 全局状态管理（目前可能用 Context）
- ❌ `docs/` - 项目文档目录

**存在的问题**:
1. 类型定义分散在各文件中，缺少统一管理
2. 业务逻辑与 UI 层耦合（page.tsx 中有较多逻辑）
3. 缺少测试目录（tests/ 或 __tests__/）

---

## 二、架构设计

### 2.1 整体架构

采用**分层架构 + 模块化**的设计思路：

```
┌─────────────────────────────────────────┐
│      表现层 (Presentation Layer)         │
│  Next.js App Router + Page Components   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      业务层 (Business Layer)            │
│   Features Modules (auth, chat, user)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      服务层 (Service Layer)              │
│   Lib Wrappers (api, auth, crypto)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      数据层 (Data Layer)                 │
│   Prisma ORM + PostgreSQL Database      │
└─────────────────────────────────────────┘
```

### 2.2 核心设计原则

1. **单向依赖**: 上层依赖下层，下层不依赖上层
2. **高内聚低耦合**: 每个功能模块独立，通过接口通信
3. **关注点分离**: UI 组件不包含业务逻辑，业务逻辑不包含数据访问
4. **单一职责**: 每个模块只负责一个业务功能

---

## 三、目录结构设计

### 3.1 完整目录树

```
src/
├── app/                          # Next.js App Router
│   ├── api/                     # API 路由
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── chat/
│   │       ├── deepseek/
│   │       ├── zhipu/
│   │       └── siliconflow/
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页（只负责组装）
│   └── globals.css              # 全局样式
│
├── components/                   # 可复用 UI 组件
│   ├── ui/                      # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── sonner.tsx
│   └── features/                # 功能性组件（可选）
│
├── features/                     # 业务功能模块 ⭐ 新增
│   ├── auth/                    # 认证模块
│   │   ├── components/          # 登录/注册 UI
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── services/            # 认证业务逻辑
│   │   │   ├── authService.ts
│   │   │   └── types.ts
│   │   ├── hooks/               # 模块专用 hooks
│   │   │   └── useAuth.ts
│   │   └── index.ts            # 模块统一导出
│   │
│   └── chat/                    # 聊天模块
│       ├── components/          # 聊天相关组件
│       │   ├── ChatArea.tsx
│       │   ├── MessageList.tsx
│       │   ├── ChatInput.tsx
│       │   └── ModelSelector.tsx
│       ├── services/            # 聊天业务逻辑
│       │   ├── chatService.ts
│       │   └── types.ts
│       ├── hooks/               # 模块专用 hooks
│       │   └── useChat.ts
│       └── index.ts
│
├── lib/                          # 技术库封装
│   ├── api/                    # API 封装
│   │   ├── ai-chat.ts
│   │   ├── client.ts
│   │   └── types.ts
│   ├── auth/                   # 认证库
│   │   ├── api.ts
│   │   ├── client.ts
│   │   └── token.ts
│   ├── crypto/                 # 加密工具
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── prisma.ts               # Prisma Client
│   ├── validation.ts           # Zod 验证
│   ├── password.ts             # 密码工具
│   └── utils.ts                # 通用工具
│
├── hooks/                       # 通用自定义 Hooks
│   └── [existing hooks]
│
├── store/                       # 全局状态管理 ⭐ 新增
│   ├── authStore.ts            # 认证状态
│   ├── chatStore.ts            # 聊天状态
│   └── index.ts                # 统一导出
│
├── types/                       # 类型定义 ⭐ 新增
│   ├── api/                    # API 相关类型
│   │   ├── chat.ts
│   │   └── auth.ts
│   ├── entities/              # 实体类型（数据库）
│   │   ├── User.ts
│   │   └── ChatHistory.ts
│   ├── shared/                # 共享类型
│   │   ├── response.ts
│   │   └── error.ts
│   └── index.ts               # 统一导出
│
├── utils/                       # 纯函数工具
│   └── [existing utilities]
│
├── config/                      # 应用配置
│   └── [existing config]
│
├── constants/                   # 常量配置
│   └── siliconflow-models.ts
│
├── assets/                      # 静态资源
│   └── [existing assets]
│
├── tests/                       # 测试文件 ⭐ 新增
│   ├── unit/                   # 单元测试
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/            # 集成测试
│   │   └── api/
│   └── e2e/                    # 端到端测试
│       └── auth.spec.ts
│
├── middleware.ts                # Next.js 中间件
└── [other files]
```

### 3.2 目录职责说明

| 目录 | 职责 | 依赖规则 |
|------|------|---------|
| `app/` | 路由入口，页面组装，极简逻辑 | 可依赖 features、lib、store |
| `components/ui/` | 基础 UI 组件（shadcn/ui） | 无业务逻辑，仅依赖 lib |
| `features/` | 业务功能模块，垂直分块 | 可依赖 lib、store、types |
| `lib/` | 技术库封装，无业务逻辑 | 可依赖 types、utils |
| `store/` | 全局状态管理 | 可依赖 types、services |
| `types/` | 全局共享类型定义 | 无依赖（最底层） |
| `utils/` | 纯函数工具 | 无依赖 |
| `tests/` | 测试文件 | 可测试任何模块 |

---

## 四、模块化设计详解

### 4.1 Features 模块化原则

**每个 features/xxx 模块包含**:
- `components/` - 该功能专用的 UI 组件
- `services/` - 该功能的业务逻辑
- `hooks/` - 该功能专用的 hooks
- `types.ts` - 模块私有类型（如果不共享）
- `index.ts` - 统一导出接口

**模块间通信规则**:
- 模块间通过 `types` 定义的接口通信
- 不直接引用另一个模块的 `components` 或 `services`
- 共享数据通过 `store/` 管理

### 4.2 模块示例：auth 模块

```typescript
// features/auth/services/authService.ts
import type { LoginRequest, RegisterRequest, AuthResponse } from './types';

export const authService = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // 调用 API 路由
    // 处理响应
    // 返回用户信息
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // 调用 API 路由
    // 处理响应
    // 返回用户信息
  },

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    // 清除 token
    // 重置状态
  },
};
```

```typescript
// features/auth/hooks/useAuth.ts
import { useAuthStore } from '@/store/authStore';
import { authService } from '../services/authService';

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    login(response.user);
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
}
```

### 4.3 模块示例：chat 模块

```typescript
// features/chat/services/chatService.ts
import type { ChatMessage, SendMessageRequest } from './types';

export const chatService = {
  /**
   * 发送消息
   */
  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    // 处理消息发送逻辑
    // 调用 AI SDK
    // 返回响应消息
  },

  /**
   * 获取历史记录
   */
  async getHistory(userId: string): Promise<ChatMessage[]> {
    // 从数据库获取历史记录
  },

  /**
   * 清空历史
   */
  async clearHistory(userId: string): Promise<void> {
    // 清空用户聊天历史
  },
};
```

---

## 五、类型管理设计

### 5.1 类型分类

| 类型目录 | 说明 | 示例 |
|---------|------|------|
| `types/api/` | API 请求/响应类型 | `LoginRequest`, `ChatResponse` |
| `types/entities/` | 数据库实体类型 | `User`, `ChatHistory` |
| `types/shared/` | 共享类型 | `ApiResponse`, `ErrorResponse` |

### 5.2 类型定义示例

```typescript
// types/api/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: UserEntity;
  token: string;
}
```

```typescript
// types/api/chat.ts
export interface SendMessageRequest {
  message: string;
  provider: 'deepseek' | 'zhipu' | 'siliconflow';
  model?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: string;
  model?: string;
}
```

```typescript
// types/entities/User.ts
export interface UserEntity {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
```

```typescript
// types/shared/response.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}
```

### 5.3 类型导出

```typescript
// types/index.ts
// API 类型
export * from './api/auth';
export * from './api/chat';

// 实体类型
export * from './entities/User';

// 共享类型
export * from './shared/response';
export * from './shared/error';
```

---

## 六、状态管理设计

### 6.1 状态管理选型

**选择 Zustand**：
- ✅ 轻量级（~1KB）
- ✅ 无需 Provider 包裹
- ✅ TypeScript 支持优秀
- ✅ 适合中大型项目
- ✅ 学习成本低

### 6.2 Store 结构

```typescript
// store/authStore.ts
import { create } from 'zustand';
import type { UserEntity } from '@/types/entities/User';

interface AuthState {
  // 状态
  user: UserEntity | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 操作
  login: (user: UserEntity) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 初始状态
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // 操作方法
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

```typescript
// store/chatStore.ts
import { create } from 'zustand';
import type { ChatMessage } from '@/types/api/chat';

interface ChatState {
  // 状态
  messages: ChatMessage[];
  currentProvider: 'deepseek' | 'zhipu' | 'siliconflow';
  currentModel?: string;
  isStreaming: boolean;

  // 操作
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setProvider: (provider: ChatState['currentProvider']) => void;
  setModel: (model: string) => void;
  setStreaming: (isStreaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // 初始状态
  messages: [],
  currentProvider: 'siliconflow',
  currentModel: undefined,
  isStreaming: false,

  // 操作方法
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  clearMessages: () => set({ messages: [] }),
  setProvider: (currentProvider) => set({ currentProvider }),
  setModel: (currentModel) => set({ currentModel }),
  setStreaming: (isStreaming) => set({ isStreaming }),
}));
```

### 6.3 Store 持久化

```typescript
// store/authStore.ts (扩展)
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
```

---

## 七、测试策略

### 7.1 测试目录结构

```
tests/
├── unit/                   # 单元测试
│   ├── services/          # 服务层测试
│   │   ├── authService.spec.ts
│   │   └── chatService.spec.ts
│   ├── hooks/            # hooks 测试
│   │   ├── useAuth.spec.ts
│   │   └── useChat.spec.ts
│   └── utils/            # 工具函数测试
│       └── crypto.spec.ts
│
├── integration/           # 集成测试
│   ├── api/              # API 集成测试
│   │   ├── login.spec.ts
│   │   └── chat.spec.ts
│   └── database/          # 数据库集成测试
│       └── prisma.spec.ts
│
└── e2e/                  # 端到端测试
    ├── auth.spec.ts
    ├── chat.spec.ts
    └── workflow.spec.ts
```

### 7.2 测试框架选型

**推荐组合**：
- **测试运行器**: Vitest（快，与 Vite 生态集成好）
- **组件测试**: React Testing Library
- **E2E 测试**: Playwright

### 7.3 测试示例

```typescript
// tests/unit/services/authService.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { authService } from '@/features/auth/services/authService';

describe('authService', () => {
  it('should login successfully with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
  });

  it('should throw error with invalid credentials', async () => {
    await expect(
      authService.login({
        email: 'invalid@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow();
  });
});
```

---

## 八、文档规范

### 8.1 文档目录结构

```
docs/
├── api/                    # API 文档
│   ├── auth.md            # 认证 API 说明
│   └── chat.md            # 聊天 API 说明
│
├── architecture/            # 架构文档
│   ├── overview.md        # 整体架构概述
│   ├── module-structure.md # 模块结构说明
│   └── data-flow.md       # 数据流向说明
│
├── development/             # 开发指南
│   ├── setup.md           # 环境搭建
│   ├── coding-standards.md # 代码规范
│   ├── git-workflow.md    # Git 工作流
│   └── testing.md         # 测试指南
│
├── deployment/              # 部署文档
│   ├── local.md           # 本地部署
│   ├── production.md      # 生产环境部署
│   └── docker.md          # Docker 部署
│
└── plans/                  # 设计文档
    └── 2026-01-29-refactor-design.md # 当前文档
```

### 8.2 代码注释规范

```typescript
/**
 * 用户认证服务
 * 提供登录、注册、退出登录等核心功能
 *
 * @module features/auth/services/authService
 */

import type { LoginRequest, RegisterRequest, AuthResponse } from './types';

/**
 * 用户登录
 *
 * @param data - 登录请求数据
 * @param data.email - 用户邮箱
 * @param data.password - 用户密码
 * @returns 认证响应，包含用户信息和 token
 * @throws {Error} 当认证失败时抛出错误
 *
 * @example
 * ```ts
 * const result = await authService.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * ```
 */
export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    // 实现逻辑
  },
};
```

---

## 九、重构实施计划

### 9.1 实施阶段

**阶段一：基础结构搭建（第 1-2 天）**
1. 创建新目录结构
2. 安装必要依赖（zustand、vitest 等）
3. 配置测试环境
4. 创建类型定义模板

**阶段二：模块迁移（第 3-4 天）**
1. 创建 auth 模块（认证功能迁移）
2. 创建 chat 模块（聊天功能迁移）
3. 迁移 UI 组件到 features 目录
4. 创建 store 状态管理

**阶段三：页面重构（第 5 天）**
1. 重构 app/page.tsx（移除业务逻辑）
2. 使用 features 模块组装页面
3. 验证功能完整性

**阶段四：测试与优化（第 6-7 天）**
1. 编写单元测试
2. 编写集成测试
3. 性能优化
4. 文档完善

### 9.2 迁移策略

**原则**：
- ✅ 不破坏现有功能
- ✅ 渐进式迁移，可随时回滚
- ✅ 每个阶段完成并测试后再进行下一阶段

**风险控制**：
- 使用 Git 分支隔离重构
- 每次提交保持代码可运行
- 关键节点打 tag 便于回滚

### 9.3 依赖安装

```bash
# 状态管理
npm install zustand

# 测试框架
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react

# 测试工具
npm install -D jsdom
```

---

## 十、成功标准

### 10.1 架构指标

- [x] 所有业务逻辑都在 `features/` 模块中
- [x] `app/` 目录下页面组件代码量减少 70%+
- [x] 类型定义集中管理，无重复定义
- [x] 状态管理清晰，无 Context 嵌套地狱
- [x] 模块间依赖单向，无循环依赖

### 10.2 质量指标

- [x] 单元测试覆盖率达到 80%+
- [x] 所有 API 集成测试通过
- [x] E2E 测试覆盖核心流程
- [x] ESLint 零错误
- [x] TypeScript 严格模式通过

### 10.3 可维护性指标

- [x] 新增功能模块时间 < 2 小时
- [x] 代码审查时间减少 50%
- [x] 新团队成员上手时间 < 1 天
- [x] 文档完整度 100%

---

## 十一、附录

### A. 参考资源

- [Next.js 最佳实践](https://nextjs.org/docs)
- [Zustand 文档](https://zustand.docs.pmnd.rs/)
- [Vitest 文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### B. 常见问题

**Q: 为什么选择 Zustand 而不是 Redux？**
A: Zustand 更轻量，无需 Provider 包裹，API 更简洁，适合当前项目规模。

**Q: 是否需要迁移到 monorepo？**
A: 暂时不需要。当前项目规模适中，单个仓库更简单高效。

**Q: features 目录下是否需要更细的划分？**
A: 不需要。当前的 components/services/hooks 结构已足够清晰，过度划分会增加复杂度。

### C. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0 | 2026-01-29 | 初始版本 |

---

**文档结束**
