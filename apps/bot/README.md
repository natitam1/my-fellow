# GrammY Telegram Bot Boilerplate

This is a simple boilerplate for a Telegram bot using [grammY](https://grammy.dev/) and TypeScript.

## Getting Started

1.  **Clone the repository** (or copy these files).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up your environment variables**:
    - Copy `.env.example` to `.env`.
    - Get a bot token from [@BotFather](https://t.me/BotFather) and paste it into `.env`.
4.  **Run the bot in development mode**:
    ```bash
    npm run dev
    ```
5.  **Build and run for production**:
    ```bash
    npm run build
    npm start
    ```

## Project Structure

- `src/index.ts`: The entry point of the bot.
- `tsconfig.json`: TypeScript configuration.
- `.env`: Environment variables (not tracked by git).
- `dist/`: Compiled JavaScript output (generated after build).

## Scripts

- `npm run dev`: Starts the bot with `nodemon` and `ts-node-esm` for automatic restarts during development.
- `npm run build`: Compiles the TypeScript code to JavaScript in the `dist/` directory.
- `npm start`: Runs the compiled bot from the `dist/` directory.
