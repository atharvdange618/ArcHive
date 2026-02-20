# Contributing to ArcHive

First off, thank you for considering contributing to ArcHive! People like you make ArcHive such a great tool.

## Where do I go from here?

If you've noticed a bug or have a question, please feel free to open an issue on GitHub.

If you want to contribute code, we welcome pull requests!

## Local Development Setup

ArcHive consists of three main parts:

1. **Backend**: A Hono REST API powered by Bun, MongoDB, and Redis (for BullMQ queues).
2. **Mobile App**: A React Native application built with Expo (`archive` folder).
3. **Chrome Extension**: A browser extension to easily save items to ArcHive (`web` folder).

### Prerequisites

- **[Bun](https://bun.sh/)**: Required for the backend.
- **Node.js (LTS)** & **npm**: Required for the React Native app.
- **[Redis](https://redis.io/)**: Required locally to run BullMQ workers for background jobs.
- **MongoDB**: For the main database.

---

### Setup Backend

The backend is built with Bun, Hono, and utilizes Vitest for testing. It also uses background workers (BullMQ over Redis) to parse URLs, tag content, and generate screenshots.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
bun install
```

**Environment Variables:**
Copy `.env.example` to `.env` and fill in the required variables (like `MONGO_URI`, `REDIS_URL`, Cloudinary keys, etc.).

**Run the Server:**
Make sure your local MongoDB and Redis instances are running.

```bash
bun dev
```

**Run Workers (Optional but needed for specific features):**
To start the background workers (for screenshot generation and tagging):

```bash
bun run start:worker
bun run start:tag-worker
```

---

### Setup Mobile App

The mobile application is located in the `archive` directory and runs on Expo.

```bash
# Navigate to the mobile app directory
cd archive

# Install dependencies using npm
npm install
```

**Run the App:**

```bash
npm start
```

From there, you can press `a` to open in an Android Emulator, or scan the QR code with the Expo Go app on your physical device.

---

### Setup Chrome Extension

The Chrome extension is located in the `web` folder.

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on "Developer mode" in the top right corner.
3. Click "Load unpacked".
4. Select the `web` folder inside the ArcHive repository.
5. The extension should now be loaded and ready for local testing.

## Pull Request Guidelines

1. **Fork the repository** and create your branch from `main`.
2. **Describe your changes** clearly in your PR description. What does it solve? How did you fix it?
3. **Write/Check tests** if you add new features to the backend or modify existing functionality (`bun run test` in the `backend` directory).
4. **Follow the code style** of the respective project (e.g., run `npm run lint` in the `archive` folder).
5. **Issue Linking**: If your PR resolves an open issue, please include `Closes #IssueNumber` in the PR description.

Thank you for your interest in improving ArcHive!
