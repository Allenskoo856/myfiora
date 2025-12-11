# Fiora Project Context

## Project Overview

Fiora is a feature-rich, cross-platform chat application developed with Node.js, React, and Socket.io. It supports persistent messaging, private/group chats, multimedia messages, and theming. The project is structured as a monorepo managed by Lerna.

## Architecture

*   **Backend:** Node.js with Koa and Socket.io (`packages/server`).
*   **Frontend:** React, Redux, Linaria (`packages/web`).
*   **Database:** MongoDB (data persistence) and Redis (caching/pub-sub).
*   **Mobile:** React Native (via Expo) for Android and iOS (`packages/app`).
*   **Docs:** Docusaurus based documentation (`packages/docs`).

## Key Directories

*   `packages/server`: The backend server API and socket logic.
*   `packages/web`: The web client application.
*   `packages/app`: Mobile application source code.
*   `packages/database`: Database connection and schema definitions (Mongoose models).
*   `packages/config`: Shared configuration files for client and server.
*   `packages/utils`: Shared utility functions.
*   `packages/bin`: CLI scripts for administrative tasks (e.g., registering users, deleting messages).

## Prerequisites

*   **Node.js:** >= 14
*   **Package Manager:** Yarn (recommended)
*   **Databases:**
    *   MongoDB (Default port: 27017)
    *   Redis (Default port: 6379)

## Setup & Installation

1.  **Install Dependencies:**
    ```bash
    yarn install
    # or
    npm install
    ```
    *Note: The project uses Lerna to bootstrap dependencies across packages.*

2.  **Infrastructure:**
    Ensure MongoDB and Redis are running. You can use the provided Docker Compose file:
    ```bash
    docker-compose up -d mongodb redis
    ```

## Running the Application

### Development Mode

To run the server and web client in development mode with hot-reloading:

1.  **Start Server:**
    ```bash
    npm run dev:server
    ```
    *Runs on port 9200 by default.*

2.  **Start Web Client:**
    ```bash
    npm run dev:web
    ```
    *Access at `http://localhost:8080` (or the port specified in webpack output).*

### Production Build

1.  **Build Web Client:**
    ```bash
    npm run build:web
    ```
    *This builds the frontend and copies assets to `packages/server/public`.*

2.  **Start Server:**
    ```bash
    npm start
    ```

## Configuration

Configuration is handled in `packages/config`. It supports environment variables (loaded via `dotenv`). Key variables include:

*   `Port`: Server port (default: 9200)
*   `Database`: MongoDB connection string (default: `mongodb://localhost:27017/fiora`)
*   `RedisHost` / `RedisPort`: Redis connection info.
*   `JwtSecret`: Secret for JWT tokens.
*   `Administrator`: Comma-separated list of admin user IDs.

## Key Commands

| Command | Description |
| :--- | :--- |
| `npm run start` | Runs the server in production mode (requires built web assets). |
| `npm run dev:server` | Runs the backend in development mode with nodemon. |
| `npm run dev:web` | Runs the frontend in development mode with Webpack Dev Server. |
| `npm run build:web` | Builds the React frontend for production. |
| `npm run lint` | Runs ESLint across the project. |
| `npm test` | Runs Jest unit tests. |
| `npm run ts-check` | Runs TypeScript type checking. |

## Development Conventions

*   **Monorepo:** Use `lerna` or root scripts to manage multiple packages.
*   **Styling:** The web client uses `linaria` for CSS-in-JS.
*   **State Management:** Redux is used for state management in the web client.
*   **API:** Communication is primarily real-time via Socket.io, with some REST endpoints served by Koa.

## 回复风格
- 后续所有回复均需要翻译成中文给用户，回复要准确简单，直接给出解决方案和原因。
