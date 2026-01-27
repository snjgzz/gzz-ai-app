# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 AI chat application using TypeScript, React 19, and Tailwind CSS 4. It features a custom authentication system and multi-provider AI integration (DeepSeek, Zhipu, SiliconFlow).

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database operations
npx prisma generate  # Generate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open database management UI
```

## Architecture

### Security-First Design
- **All API communications are encrypted** using AES-256-GCM
- Client-side encryption before sending, server-side decryption upon receipt
- Encryption key stored in `NEXT_PUBLIC_API_CRYPTO_KEY` (32-byte base64)
- Never send plaintext data through API routes

### API Structure
```
src/app/api/
├── auth/           # Authentication endpoints (login, register)
└── chat/           # AI provider endpoints
    ├── deepseek/
    ├── zhipu/
    └── siliconflow/
```

All API routes follow this pattern:
1. Parse encrypted request body using `lib/crypto/server.ts`
2. Process business logic
3. Encrypt response using `lib/crypto/server.ts`
4. Return encrypted JSON

### Component Guidelines
- **Always use shadcn/ui components** for UI elements (buttons, dialogs, selects, etc.)
- Existing shadcn components are in `src/components/ui/`
- Add new shadcn components as needed rather than building from scratch
- Use `cn()` utility from `lib/utils.ts` for conditional className merging

### Multi-Provider AI Integration
- AI providers use OpenAI-compatible SDKs (`@ai-sdk/openai`)
- Each provider has its own route in `src/app/api/chat/`
- Model constants defined in `src/constants/` (e.g., `siliconflow-models.ts`)
- Streaming responses via Vercel AI SDK's `streamText()`

### Authentication System
- Custom implementation (no NextAuth/JWT)
- Password hashing with bcryptjs (`lib/password.ts`)
- User sessions stored in PostgreSQL via Prisma
- Zod schemas for input validation (`lib/validation.ts`)

### Tech Stack Details
- **React Compiler**: Enabled via `babel-plugin-react-compiler` - automatic optimization
- **Path aliases**: `@/*` maps to `./src/*`
- **TypeScript**: Strict mode enabled
- **Database**: Prisma ORM with PostgreSQL

## Key Files
- `src/lib/crypto/client.ts` - Client-side encryption utilities
- `src/lib/crypto/server.ts` - Server-side encryption utilities
- `src/lib/prisma.ts` - Database client singleton
- `src/lib/validation.ts` - Zod validation schemas
- `src/app/layout.tsx` - Root layout with Geist fonts
- `src/app/page.tsx` - Main chat interface

## Environment Variables
Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_CRYPTO_KEY` - 32-byte base64 encryption key
- Provider API keys (e.g., `SILICONFLOW_API_KEY`)
