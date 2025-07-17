# ChitChat App

A modern, real-time chat application with a beautiful, responsive user interface. This project features direct messaging, group chats, friend management, and an integrated, configurable AI assistant powered by Google Gemini.

This application is built entirely as a client-side React application and uses mock data to simulate a full-featured chat experience. It does not require a backend database or build tools like Vite or Webpack.

![ChitChat App Screenshot](https://i.imgur.com/rSCTqA1.png)

## Features

- **Authentication**: Seamless sign-in and sign-up flows.
- **Direct & Group Messaging**: Clean and intuitive chat interface for both one-on-one and group conversations.
- **Friend Management**:
    - View online/all friends.
    - Search for friends by username.
    - Add new friends by searching for their username or email.
    - View and manage friend requests (UI only).
- **Configurable AI Chatbots**:
    - Add multiple AI bots to your chat list.
    - Configure bots to use specific LLM providers (e.g., Google Gemini).
    - Provide your own API key for each bot, which is stored in-memory only for the current session.
- **Rich User Profiles**:
    - Edit your profile avatar, name, and email.
    - Add personal details like Date of Birth and social media links (Facebook, LinkedIn, Zalo).
- **Advanced Chat Management**:
    - A slide-out panel for managing group members and chat settings.
    - Role-based permissions for group admins (add/remove members, promote others).
    - View shared media and links within any conversation.
- **Modern UI/UX**:
    - Fully responsive design that works on all screen sizes.
    - Clean, pink-themed aesthetic.
    - Modals for all key actions (creating groups, editing profiles, etc.).

## Technology Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **AI Integration**: Google Gemini (`@google/genai`)
- **Dependencies**: Served via ES Modules from `esm.sh` (no `node_modules` or `package.json` required).

## Prerequisites

- A modern web browser that supports ES Modules (Chrome, Firefox, Edge, Safari).
- A local web server to serve the files. This is required because browser security policies restrict ES Modules from running on the `file://` protocol.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Run the Application with a Local Server

Since this project has no build step, you just need to serve the files from the project's root directory. Here are two simple ways to do this:

#### Option A: Using Python (Recommended if you have Python installed)

Python comes with a built-in web server. Run this command from the project's root directory:

```bash
# For Python 3
python -m http.server

# Or, if the above doesn't work, you might have an older version:
python -m SimpleHTTPServer
```

Then, open your browser and navigate to `http://localhost:8000`.

#### Option B: Using Node.js and `live-server`

If you have Node.js installed, you can use the `live-server` package, which automatically reloads the page when you make changes to the code.

1.  Install `live-server` globally (if you haven't already):
    ```bash
    npm install -g live-server
    ```
2.  Run `live-server` from the project's root directory:
    ```bash
    live-server
    ```
Your browser will automatically open to the correct address (usually `http://127.0.0.1:8080`).

### 3. Using the Application

- **Authentication**: Start by creating an account on the "Sign up" page or using the "Sign in" flow. This is a simulation and no data is sent to a server.
- **AI Bot Configuration**: To use an AI chatbot, you must configure it by clicking the `+` icon on the far-left server list. You will be prompted to provide your own API key for the selected service (e.g., Google Gemini).
- **Security Note**: API keys are stored **only in memory for the current browser session** and are not persisted. For security reasons, never leave the application open in an untrusted environment.

## Project Structure

The project is organized into logical folders to make navigation and development straightforward.

```
/
├── components/           # Reusable React components
│   ├── auth/             # Sign-in/Sign-up forms
│   ├── chat/             # Core chat interface components (Sidebar, Header, etc.)
│   ├── icons/            # SVG Icon components
│   └── modals/           # All modal dialogs (Create Group, User Profile, etc.)
├── services/             # Services for communicating with external APIs (e.g., Gemini)
├── App.tsx               # Main application component (handles auth state)
├── constants.ts          # Mock data for users, chats, and messages
├── index.html            # The main HTML entry point for the application
├── index.tsx             # The React root renderer
├── types.ts              # Shared TypeScript types and interfaces
└── README.md             # This file
```
"# ChitChat_FE" 
