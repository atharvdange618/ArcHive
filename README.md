# ArcHive

**Your Personal Digital Sanctuary for Thoughts, Links, and Code.**

---

## Introduction

Welcome to **ArcHive** - a multi-platform digital capture tool designed to be your personal "second brain." In an age of information overload, ArcHive provides a calm, uncluttered, and intelligent space to effortlessly save, organize, and retrieve all the valuable pieces of information you encounter daily. From fleeting thoughts and insightful articles to crucial code snippets, ArcHive ensures your knowledge is not just stored, but truly _archived_ and always at your fingertips.

## The Philosophy Behind ArcHive

ArcHive is more than just an application; it's a testament to the belief that technology, much like music, can be a profound form of art.

As a Full Stack Engineer who sees the artistry in crafting elegant solutions and harmonious systems, I, embarked on this project with a clear vision: to build a tool that is not only highly functional but also intuitive, aesthetically pleasing, and deeply personal.

Inspired by the need for a private, uncluttered space to capture and manage the diverse streams of information that fuel creativity and learning, ArcHive was born. It's about creating a digital extension of your mind - a place where information isn't just dumped, but thoughtfully curated and easily retrieved, much like a well-organized library of your favorite movies or anime.

My goal with ArcHive is to empower creators, thinkers, and anyone passionate about knowledge to focus on their craft without the burden of information overload. It's about making personal knowledge management an effortless and even delightful experience.

## Features

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
  - **Platform Categorization:** Automatically categorizes links by their source platform (GitHub, YouTube, Twitter, etc.) with visual badges and icons.
  - **Browse by Platform:** Dedicated browse tab to view and filter content by platform, making it easy to find all your saved GitHub repos, YouTube videos, or tweets in one place.
  - **Platform Statistics:** See at a glance how many items you have saved from each platform.
  - **Infinite Scroll:** Seamlessly load more content as you scroll with optimized pagination using TanStack Query.
  - **Recent Search History:** Quick access to your recent searches for faster navigation.
  - **Rich Metadata:** Organize your content with custom titles, descriptions, and flexible tagging.
  - **Content Management:** Easily view, edit, and delete your archived content.
- **Profile Management:**
  - **User Profiles:** Manage your account from a dedicated profile screen with real-time statistics.
  - **Profile Pictures:** Upload and update your profile picture with Cloudinary-powered image storage.
  - **Usage Statistics:** Track your content creation with detailed stats showing total items and breakdown by type.
  - **Account Customization:** Update your first name and last name to personalize your experience.

## Roadmap

We are constantly working to improve ArcHive and make it the ultimate digital sanctuary. Here are some of the key features planned for the near future:

- **Custom Collections / Folders:** Create dedicated, customized spaces to organize your saved links, text bits, and code snippets by specific topics (e.g., "Web Dev", "DSA", "ML", "Inspiration").
- **Web Application:** A fully fledged web dashboard allowing you to view and manage your entire saved knowledge base seamlessly from a desktop browser.
- **Spaced Repetition / Resurfacing:** A subtle notification system designed to gently remind you to revisit older or unread saved items, turning your archive into an active learning tool rather than a forgotten storage bin.
- **Shared Collections:** Following the release of the Web App, you will be able to select specific collections of resources and generate public, shareable links to effortlessly distribute curated knowledge with other developers.

## Releases

Detailed information about all releases (including the latest v1.1.0) can be found in our [Releases Guide](RELEASES.md).

## Chrome Extension

**Save content directly from your browser!**

ArcHive now has a Chrome extension that allows you to quickly save web pages to your personal knowledge base without switching apps. Simply click the extension icon while browsing any webpage to instantly archive it.

### Features:

- One-click page saving from any website
- Secure JWT-based authentication
- Automatic token refresh
- Persistent login sessions
- Clean, intuitive interface

### Installation:

**From Source (Development):**

1. Clone the repository and navigate to the `web` folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `web` folder

**From Chrome Web Store:**
_(Coming soon)_

For detailed instructions and usage guide, see the [Chrome Extension README](web/README.md).

---
