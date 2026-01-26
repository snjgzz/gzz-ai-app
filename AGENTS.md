# AGENTS.md

此文档为在此仓库中工作的 AI 代理编码助手提供指导。

## 核心命令

### 开发与构建
```bash
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint 检查代码
```

### 数据库
```bash
npx prisma generate  # 生成 Prisma Client
npx prisma db push   # 推送 schema 到数据库
npx prisma studio    # 打开数据库管理界面
```

### 测试
项目当前未配置测试框架。如需添加测试，建议使用 Vitest 或 Jest。

## 项目技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5 (strict mode)
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui
- **AI**: Vercel AI SDK + OpenAI SDK
- **编译器**: React Compiler (已启用)
- **数据库**: Prisma ORM
- **安全**: 加密 API（AES-256-GCM）

## 代码风格指南

### 导入规范
- 类型导入使用 `import type`：`import type { Metadata } from "next"`
- 第三方包优先使用命名导入：`import { useChat } from '@ai-sdk/react'`
- 相对路径使用别名 `@/*`：`import { Button } from '@/components/Button'`

### 组件定义
- 客户端组件必须添加 `'use client'` 指令在文件首行
- 服务端组件默认（无需指令）
- 函数组件使用 PascalCase：`export default function Home() {}`
- 组件 Props 类型使用 `Readonly<>` 包装：
  ```tsx
  interface Props {
    children: React.ReactNode;
  }
  export default function Layout({ children }: Readonly<Props>) {}
  ```

### UI 组件规范（重要）
- **必须使用 shadcn/ui 组件**，而非自己实现
- shadcn/ui 组件位于 `@/components/ui/`
- 使用 `cn()` 工具函数合并 Tailwind 类名：`import { cn } from '@/lib/utils'`
- 常用组件：Button, Dialog, Input, Card 等
- 需要添加新 UI 组件时使用 `npx shadcn@latest add <component>`

### 命名约定
- **组件**: PascalCase (MyComponent, UserProfile)
- **函数/变量**: camelCase (sendMessage, inputValue)
- **常量**: UPPER_SNAKE_CASE (API_BASE_URL)
- **类型/接口**: PascalCase (MessageProps, UserData)
- **文件**: kebab-case (user-profile.tsx) 或 PascalCase (组件文件夹)

### TypeScript 使用
- 启用严格模式，所有类型必须显式声明
- 使用 `as` 进行类型断言（谨慎使用）
- 首选泛型而非 `any`：`Array<string>` 而非 `any[]`
- 枚举优于字符串字面量联合（有限集合）

### React 模式
- 使用函数组件和 Hooks
- 状态管理：优先 `useState`，复杂场景考虑 Context 或第三方库
- 表单处理：使用 `React.FormEvent` 类型
- 异步操作：使用 `async/await`，配合 `try/catch`
- 条件渲染：使用三元表达式，避免不必要的 `return null`

### 样式规范
- 使用 Tailwind CSS 工具类
- 使用 `cn()` 合并动态类名
- 避免内联样式（除非动态值）
- 响应式设计：使用断点前缀 `sm:`, `md:`, `lg:`, `xl:`
- 状态样式：`hover:`, `focus:`, `active:`, `disabled:`

### API 路由
- 使用 Next.js App Router 的 `route.ts` 文件
- 路径：`src/app/api/[endpoint]/route.ts`
- 方法命名：`export async function POST(req: Request) {}`
- 响应使用 `Response` 对象或 SDK 提供的流式响应
- **加密 API**：使用项目提供的加密工具
  - 读取请求：`const data = await readEncryptedJson<Type>(req)`
  - 返回响应：`return jsonEncryptedResponse(data, { status: 200 })`
  - 工具函数位置：`@/lib/crypto/server`

### 数据库访问
- Prisma Client 实例：`import { prisma } from '@/lib/prisma'`
- 使用单例模式，已在 `src/lib/prisma.ts` 中配置
- 不要在每个文件中创建新的 PrismaClient 实例

### 加密工具
- 客户端：`import { encryptPayload, decryptPayload } from '@/lib/crypto/client'`
- 服务端：`import { encryptPayload, decryptPayload, readEncryptedJson, jsonEncryptedResponse } from '@/lib/crypto/server'`
- 类型定义：`import type { EncryptedPayload } from '@/lib/crypto/types'`

### 错误处理
- API 调用：始终 try/catch 并返回适当的错误响应
- 用户输入：使用 Zod 或类似库进行验证
- 空的 catch 块必须有注释说明原因
- 错误展示：使用 Toast 或 Modal 组件（可使用 shadcn/ui）

### 文件组织
```
src/
  app/          # Next.js 路由与页面
    api/        # API 路由
      auth/     # 认证相关 API
      chat/     # 聊天相关 API
  components/   # 可复用 UI 组件
    ui/         # shadcn/ui 组件
  hooks/        # 自定义 Hooks
  lib/          # 第三方库配置与封装
    crypto/     # 加密工具
  utils/        # 纯函数工具
  types/        # TypeScript 类型定义
  constants/    # 常量配置
  store/        # 全局状态管理（如需要）
  config/       # 应用配置
  assets/       # 静态资源
```

### 注释规范
- 函数/组件添加 JSDoc：`/** 描述功能 */`
- 复杂逻辑添加行内注释：`// 为什么这样做`
- TODO 注释：`// TODO: 待实现功能`

### 代码提交前检查
```bash
npm run lint     # 确保无 ESLint 错误
npm run build    # 确保构建成功
```

## 特殊注意事项

- React Compiler 已启用，自动优化记忆化，手动使用 `useMemo`/`useCallback` 的情况较少
- 环境变量使用 `process.env.VARIABLE_NAME`，类型定义在 `.env.local` 或通过声明文件
- API 密钥等敏感信息应使用环境变量，永不提交到代码库
- 图片等静态资源放在 `public/` 目录，或使用 `next/image` 优化
- 所有 API 请求和响应都应使用加密工具（除非有特殊原因）
- Prisma schema 修改后需要运行 `npx prisma generate`

## 扩展开发

如需添加新功能：
1. 先确定使用客户端还是服务端组件
2. 遵循现有目录结构创建文件
3. UI 组件优先使用 shadcn/ui，必要时通过 `npx shadcn@latest add` 添加
4. 运行 `npm run lint` 检查代码质量
5. 运行 `npm run build` 确保构建无误
