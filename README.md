# ArcHive

**Your Personal Digital Sanctuary for Thoughts, Links, and Code.**

---

## 🌟 Introduction

Welcome to **ArcHive** – a multi-platform digital capture tool designed to be your personal "second brain." In an age of information overload, ArcHive provides a calm, uncluttered, and intelligent space to effortlessly save, organize, and retrieve all the valuable pieces of information you encounter daily. From fleeting thoughts and insightful articles to crucial code snippets, ArcHive ensures your knowledge is not just stored, but truly _archived_ and always at your fingertips.

## 💡 The Philosophy Behind ArcHive

ArcHive is more than just an application; it's a testament to the belief that technology, much like music, can be a profound form of art.

As a Full Stack Engineer who sees the artistry in crafting elegant solutions and harmonious systems, I, embarked on this project with a clear vision: to build a tool that is not only highly functional but also intuitive, aesthetically pleasing, and deeply personal.

Inspired by the need for a private, uncluttered space to capture and manage the diverse streams of information that fuel creativity and learning, ArcHive was born. It's about creating a digital extension of your mind – a place where information isn't just dumped, but thoughtfully curated and easily retrieved, much like a well-organized library of your favorite movies or anime.

My goal with ArcHive is to empower creators, thinkers, and anyone passionate about knowledge to focus on their craft without the burden of information overload. It's about making personal knowledge management an effortless and even delightful experience.

## ✨ Features

- **Secure & Private:** Your personal knowledge is protected. ArcHive ensures secure registration and login with robust password hashing (Argon2) and JWT-based authentication. Features include a password visibility toggle and secure logout via token blacklisting.
- **Multi-Content Support:** Effortlessly save text notes, web links, and code snippets in one unified system.
- **Seamless Content Capture:**
  - **Share From Anywhere:** Share links and text directly from other apps into ArcHive for quick saving.
  - **Deep Linking:** Open content directly in the app via shared links.
  - **In-App Capture:** A dynamic Floating Action Button (FAB) allows for quick and delightful creation of new content.
- **Intelligent Content Processing:**
  - **Automatic Parsing:** ArcHive automatically parses web links to extract titles, descriptions, and other metadata. It includes specialized parsers for platforms like GitHub, Instagram, and YouTube.
  - **Screenshot Generation:** For every link you save, ArcHive generates a screenshot for a quick visual reference using Puppeteer and stores it on Cloudinary.
  - **Automated Tagging:** An intelligent tag engine analyzes content to suggest relevant tags, making organization effortless.
- **Powerful Organization & Retrieval:**
  - **Full-Text Search:** Find exactly what you need with a powerful search that scans the entire content of your saved items, not just titles. Matching keywords are highlighted for context.
  - **Content Type Filtering:** Quickly filter your content by type (All, Link, Text, Code) for focused browsing.
  - **Infinite Scroll:** Seamlessly load more content as you scroll with optimized pagination using TanStack Query.
  - **Recent Search History:** Quick access to your recent searches for faster navigation.
  - **Rich Metadata:** Organize your content with custom titles, descriptions, and flexible tagging.
  - **Content Management:** Easily view, edit, and delete your archived content.
- **Profile Management:**
  - **User Profiles:** Manage your account from a dedicated profile screen with real-time statistics.
  - **Profile Pictures:** Upload and update your profile picture with Cloudinary-powered image storage.
  - **Usage Statistics:** Track your content creation with detailed stats showing total items and breakdown by type.
  - **Account Customization:** Update your first name and last name to personalize your experience.
- **Polished User Experience:**
  - **Cross-Platform:** Access your ArcHive from anywhere with dedicated mobile applications for iOS & Android.
  - **Modern UI:** A clean, intuitive interface with smooth animations (React Native Reanimated), gesture support, and high-quality components like interactive modals.
  - **Performance Optimized:** FlashList implementation for smooth scrolling even with large content libraries.
  - **Toast Notifications:** Real-time feedback for all actions with elegant toast messages.

## 🔒 Security Features

ArcHive implements several security best practices to protect your data:

- **Secure Authentication:** Argon2 password hashing with JWT tokens, with improved authentication flows.
- **Rate Limiting:** Protection against brute force and DoS attacks.
- **CORS Protection:** Configurable allowed origins to prevent unauthorized access.
- **Request Size Limits:** 1MB body size limit to prevent resource exhaustion.
- **Token Blacklisting:** Secure logout with token invalidation.
- **Custom Error Handling:** A robust error handling mechanism to prevent information leaks.
- **Environment Validation:** Zod-based validation for all configuration.
- **Dependency Updates & Security Enhancements:** Regular updates to dependencies and ongoing security enhancements to protect your data.

## 🛠️ Technologies Used

ArcHive is built with a modern, robust, and scalable technology stack:

### Backend

- **Hono:** A lightweight, ultra-fast web framework for the API.
- **Bun:** The incredibly fast JavaScript runtime powering the backend.
- **MongoDB:** A flexible NoSQL database for storing diverse content types.
- **Mongoose:** An elegant ODM (Object Data Modeling) for MongoDB, simplifying data interactions.
- **Puppeteer & Cheerio:** For robust web scraping, content parsing, and screenshot generation.
- **Cloudinary:** Cloud-based image and video management for storing profile pictures and screenshots.
- **BullMQ & Redis:** Queue-based background job processing for screenshots and automated tagging.
- **Argon2:** For secure and robust password hashing.
- **Zod:** A TypeScript-first schema declaration and validation library, ensuring data integrity.
- **NLP Dependencies:** Content extraction and natural language processing using @mozilla/readability, jsdom, natural, franc, and stopwords-iso.

### Mobile (Expo / React Native)

- **Expo Router:** For intuitive, file-based navigation across mobile platforms.
- **TanStack Query:** For robust data fetching, caching, and state management, including infinite scroll pagination.
- **React Hook Form & Zod:** For building performant, validated forms.
- **Expo Share Intent:** To handle incoming data from other applications.
- **Expo Image Picker:** For selecting and uploading profile pictures.
- **FlashList:** High-performance list rendering from Shopify for smooth scrolling.
- **React Native Modal:** For creating highly customizable and professional modals.
- **React Native Reanimated:** Powering smooth and engaging UI animations.
- **React Native Gesture Handler:** For native-driven touch and gesture interactions.
- **React Native Toast Message:** Elegant toast notifications for user feedback.

### Web (Planned)

- The project structure includes a placeholder for a future web application, aiming for a consistent experience across all platforms.

## 🚀 Getting Started

To get ArcHive up and running on your local machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/en/) (LTS version recommended)
- [Bun](https://bun.sh/docs/installation)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) (or use Docker for a quick setup)

### Backend Setup

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Copy the example environment file and configure it:

   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and configure all required values:

   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key (generate with `openssl rand -base64 32`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From [Cloudinary Console](https://cloudinary.com/console) for image uploads
   - `CORS_ORIGINS`: Comma-separated list of allowed frontend origins

   See `.env.example` for detailed descriptions of each variable.

5. Start the backend server:

   ```bash
   bun run dev
   ```

   The server should start on `http://localhost:3000`.

6. Start the background workers (in separate terminals):

   ```bash
   bun start:worker      # Screenshot generation worker
   bun start:tag-worker  # Automated tagging worker
   ```

### Mobile App Setup

1. Navigate to the `mobile` directory:

   ```bash
   cd mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Expo development server:

   ```bash
   npm start
   ```

   This will open a new tab in your browser with the Expo Dev Tools. You can then scan the QR code with the Expo Go app on your phone, or choose to run it on an Android emulator or iOS simulator.

---
