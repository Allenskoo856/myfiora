# Fiora - AI Coding Agent Instructions

## Project Overview
Fiora is a full-stack real-time chat application built with Socket.IO, Koa, MongoDB, Redis, and React. The project uses Lerna monorepo with independent packages.

## Architecture

### Monorepo Structure
- **packages/server** - Koa + Socket.IO backend (port 9200)
- **packages/web** - React web client (builds to `server/public/`)
- **packages/app** - React Native (Expo) mobile app
- **packages/database** - Mongoose models + Redis client
- **packages/utils** - Shared utilities
- **packages/config** - Server/client configuration
- **packages/bin** - CLI scripts for admin tasks
- **packages/i18n** - Internationalization
- **packages/assets** - Static resources (images, fonts, audios)
- **packages/docs** - Docusaurus documentation site

### Key Technologies
- **Backend**: Koa, Socket.IO v4, MongoDB (Mongoose), Redis, JWT auth
- **Frontend**: React, Redux (classic), socket.io-client, Webpack
- **Mobile**: React Native (Expo SDK 42), React Navigation
- **Build**: Lerna, TypeScript, Webpack
- **Testing**: Jest, ts-jest, Testing Library

## Critical Workflows

### Development Commands
```bash
# Start server (requires MongoDB + Redis running)
yarn dev:server

# Start web client dev server
yarn dev:web

# Build web client (outputs to packages/server/public/)
yarn build:web

# Start mobile app (Expo)
yarn dev:app

# Run all tests
yarn test

# Type checking
yarn ts-check

# Linting
yarn lint
```

### Production Deployment
1. `yarn build:web` - Build web client
2. Web assets copied to `packages/server/public/`
3. `yarn start` - Starts production server
4. Docker: `docker-compose up` (includes MongoDB, Redis, app)

### Health Check
Run server with `--doctor` flag to verify MongoDB, Redis, port availability, and web build:
```bash
cd packages/server && yarn start -- --doctor
```

## Socket.IO Communication Pattern

### Server-Side Route Registration
Routes are defined as exported async functions in `packages/server/src/routes/*.ts`:

```typescript
// Example: packages/server/src/routes/user.ts
export async function register(ctx: Context<{ username: string; password: string }>) {
    const { username, password } = ctx.data;
    // ... implementation
    return userData;
}
```

Routes are automatically registered via `registerRoutes` middleware. The `Context<T>` object provides:
- `ctx.data` - Client payload
- `ctx.socket.user` - Authenticated user ID
- `ctx.socket.id` - Socket connection ID
- `ctx.socket.ip` - Client IP address
- `ctx.socket.emit(target, event, data)` - Emit to specific socket/room

### Client-Side Communication
Web/app clients use `socket.emit(event, data, callback)` pattern:

```typescript
// packages/web/src/service.ts wraps socket calls
const [err, result] = await fetch('register', { username, password });
```

### Middleware Chain
Server socket middleware order matters (`packages/server/src/app.ts`):
1. **seal** - Block banned IPs/users
2. **isLogin** - Verify authentication (sets `socket.data.user`)
3. **isAdmin** - Check admin status (sets `socket.data.isAdmin`)
4. **frequency** - Rate limiting (new users: 5/min, regular: 20/min)
5. **registerRoutes** - Route handler execution

## Database Patterns

### Mongoose Models
Located in `packages/database/mongoose/models/`. Key models:
- **User** - Authentication, avatar, expressions, tags
- **Group** - Chat groups (default group: "fiora")
- **Message** - Chat messages with content types
- **Friend** - Friend relationships
- **Socket** - Active socket connections (cleared on server start)
- **Notification** - Push notification tokens

### Redis Usage
Redis keys follow pattern functions in `packages/database/redis/initRedis.ts`:
- `getSealUserKey(userId)` - Ban status
- `getNewUserKey(userId)` - 24-hour new user flag
- `getNewRegisteredUserIpKey(ip)` - Registration rate limiting

## Package Aliasing
Internal packages use `@fiora/*` namespace:
```typescript
import config from '@fiora/config/server';
import logger from '@fiora/utils/logger';
import User from '@fiora/database/mongoose/models/user';
```

Configured via Lerna + yarn workspaces. No path aliases in tsconfig - use full package names.

## State Management

### Web Client (Redux Classic)
- Store: `packages/web/src/state/store.ts` (single reducer)
- State shape: User info, linkmans (groups/friends), messages, focus, notifications
- No Redux Toolkit - uses plain action creators and reducer
- Socket events trigger Redux actions directly

### Mobile App
Similar Redux pattern in `packages/app/src/state/`

## Configuration

### Environment Variables
Server config (`packages/config/server.ts`) reads from:
- `Database` - MongoDB connection string
- `RedisHost`, `RedisPort` - Redis connection
- `Port` - Server port (default: 9200)
- `Administrator` - Admin user IDs (comma-separated)
- `DisableRegister` - Disable new registrations
- `JwtSecret` - JWT signing key
- `ALIYUN_OSS` - Enable Aliyun OSS for file uploads

Client config (`packages/config/client.ts`) reads from:
- `Server` - Backend URL (defaults to localhost:9200 in dev)
- `DefaultTheme` - UI theme
- `DisableDeleteMessage` - Prevent message deletion

### Development Environment
Load from `.env` file via `dotenv/config` with `DOTENV_CONFIG_PATH=../../.env`

## Testing Conventions
- Jest config: `jest.config.js` (root level)
- Test files: `packages/*/test/**/*.spec.ts`
- Coverage excludes: config, test helpers
- Uses `ts-jest` with `isolatedModules: true`

## CLI Scripts
Located in `packages/bin/scripts/`:
- `doctor.ts` - Health check (MongoDB, Redis, port, web build)
- `register.ts` - Create user account
- `deleteUser.ts` - Remove user
- `getUserId.ts` - Find user ID by username
- `fixUsersAvatar.ts` - Repair avatar URLs

Run via: `yarn script` (uses Lerna to execute bin package)

## Common Gotchas
- Web client must be built (`yarn build:web`) before production server starts - web assets served from `server/public/`
- Server clears all Socket documents on startup (in `main.ts`)
- Default group "fiora" is auto-created if missing on server start
- Rate limiting more aggressive for users registered < 24 hours ago
- `assert()` calls in routes automatically return error messages to client
- File uploads go to Aliyun OSS if enabled, else local `server/public/avatar/`

## copilot-instructions.md
- 每次回复时候需要使用简体中文，语义表达准确、不啰嗦、不重复、直接给出解决方案
- 没经过用户同意，不要随意创建makdown文件、以及shell脚本、允许创建和修改项目相关的ts、js文件及config文件
- 当前项目是前后端分离的项目、每次修改代码之后请注意前后端代码是否需要同时修改、重载后前后端进程需要一起启动
