# ArcHive

**Your Personal Digital Sanctuary for Thoughts, Links, and Code.**

---

## 🌟 Introduction

Welcome to **ArcHive** – a multi-platform digital capture tool designed to be your personal "second brain." In an age of information overload, ArcHive provides a calm, uncluttered, and intelligent space to effortlessly save, organize, and retrieve all the valuable pieces of information you encounter daily. From fleeting thoughts and insightful articles to crucial code snippets, ArcHive ensures your knowledge is not just stored, but truly *archived* and always at your fingertips.

## 💡 The Philosophy Behind ArcHive

ArcHive is more than just an application; it's a testament to the belief that technology, much like music, can be a profound form of art.

As a Full Stack Engineer who sees the artistry in crafting elegant solutions and harmonious systems, I, Atharv Dange, embarked on this project with a clear vision: to build a tool that is not only highly functional but also intuitive, aesthetically pleasing, and deeply personal.

Inspired by the need for a private, uncluttered space to capture and manage the diverse streams of information that fuel creativity and learning, ArcHive was born. It's about creating a digital extension of your mind – a place where information isn't just dumped, but thoughtfully curated and easily retrieved, much like a well-organized library of your favorite movies or anime.

My goal with ArcHive is to empower creators, thinkers, and anyone passionate about knowledge to focus on their craft without the burden of information overload. It's about making personal knowledge management an effortless and even delightful experience.

## ✨ Features

*   **Secure User Authentication:** Your personal knowledge is private. ArcHive ensures secure registration and login to keep your data safe.
*   **Multi-Content Type Support:** Seamlessly save text notes, web links (with rich previews), and code snippets, all within one unified system.
*   **Rich Metadata & Tagging:** Organize your content with titles, descriptions, and flexible tagging to ensure easy categorization and retrieval.
*   **Powerful Full-Text Search:** Find exactly what you need, when you need it, with an intelligent search engine that understands the context of your archived items.
*   **Intuitive Content Capture:** A dynamic Floating Action Button (FAB) allows for quick and delightful capture of new content, adapting to your needs.
*   **Cross-Platform Accessibility:** Access your ArcHive from anywhere with dedicated mobile applications (iOS & Android) and a planned web interface.

## 🛠️ Technologies Used

ArcHive is built with a modern, robust, and scalable technology stack:

### Backend
*   **Hono:** A lightweight, ultra-fast web framework for the API.
*   **Bun:** The incredibly fast JavaScript runtime powering the backend.
*   **MongoDB:** A flexible NoSQL database for storing diverse content types.
*   **Mongoose:** An elegant ODM (Object Data Modeling) for MongoDB, simplifying data interactions.
*   **Argon2:** For secure and robust password hashing.
*   **Zod:** A TypeScript-first schema declaration and validation library, ensuring data integrity.

### Mobile (Expo / React Native)
*   **Expo Router:** For intuitive, file-based navigation across mobile platforms.
*   **React Native Reanimated:** Powering smooth and engaging UI animations.
*   **React Native Gesture Handler:** For native-driven touch and gesture interactions.
*   **Expo Ecosystem:** Leveraging various Expo modules for fonts, web browsing, and more, ensuring a seamless development and user experience.

### Web (Planned)
*   The project structure includes a placeholder for a future web application, aiming for a consistent experience across all platforms.

## 🚀 Getting Started

To get ArcHive up and running on your local machine, follow these steps:

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [Bun](https://bun.sh/docs/installation)
*   [MongoDB](https://www.mongodb.com/docs/manual/installation/) (or use Docker for a quick setup)

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Create a `.env` file in the `backend` directory based on `.env.example` (you'll need to create this example file if it doesn't exist, or just create `.env` directly):
    ```
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=a_strong_secret_key_for_jwt
    MONGODB_URI_TEST=your_mongodb_test_connection_string # For running tests
    ```
    *Replace `your_mongodb_connection_string` and `a_strong_secret_key_for_jwt` with your actual values.*
4.  Start the backend server:
    ```bash
    bun run dev
    ```
    The server should start on `http://localhost:3000`.

### Mobile App Setup

1.  Navigate to the `mobile` directory:
    ```bash
    cd mobile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Expo development server:
    ```bash
    npm start
    ```
    This will open a new tab in your browser with the Expo Dev Tools. You can then scan the QR code with the Expo Go app on your phone, or choose to run it on an Android emulator or iOS simulator.

---
