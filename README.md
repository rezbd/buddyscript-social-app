# 📱 Full-Stack Social Media Application

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

> A responsive, full-stack social networking web application built as a monorepo. Designed with a focus on seamless user experience, optimistic UI updates, and secure JWT authentication.

---

## ✨ Features
* **Secure Authentication:** JWT-based user registration, login, and protected routing.
* **Dynamic Feed:** Users can create posts with text and base64 image uploads, toggle public/private visibility, and view a sorted feed.
* **Rich Interactivity:** Users can like posts, add comments, and nest replies.
* **Performance Optimized:** Lazy loading for comment threads and optimistic UI updates for instant interaction feedback.

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| **Frontend** | React 18, React Router v6, Vite, Axios  |
| **Backend** | Node.js, Express.js                     |
| **Database** | MongoDB via Mongoose                    |
| **Auth** | JSON Web Tokens (JWT) & bcryptjs        |
| **Styling** | Custom CSS (No external UI frameworks)  |

---

## 🏗️ Architecture & Project Structure

The project utilizes a standard monorepo structure, separating the client and server concerns while keeping them in a unified repository for easy development.

```text
/social-app-monorepo
├── /backend                   # Node.js REST API
│   ├── /config                # Database connection setup
│   ├── /controllers           # Route logic (Auth, Posts, Comments)
│   ├── /middleware            # JWT verification & Error handling
│   ├── /models                # Mongoose Schemas
│   ├── /routes                # Express Router definitions
│   └── server.js              # Application entry point
│
└── /frontend                  # React Single Page Application
    ├── /public                # Static CSS and Image assets
    ├── /src
    │   ├── /api               # Preconfigured Axios instance
    │   ├── /components        # Reusable UI (Navbar, PostItem, etc.)
    │   ├── /context           # Global AuthContext state management
    │   ├── /pages             # Route views (Login, Register, Feed)
    │   ├── App.jsx            # Router configuration & Guards
    │   └── main.jsx           # React DOM entry
    └── vite.config.js         # Vite bundler configuration


---

## 🧠 Key Engineering Decisions

* **Optimistic UI for Likes:** Both post and comment likes update the local React state immediately before the API call resolves. If the network request fails, the state gracefully reverts. This keeps the UI feeling instantaneous.
* **Efficient State Management:** When a new post is created, the `Feed` component prepends it to the local state via a callback. This eliminates the need for a redundant `GET /api/posts` network call, saving bandwidth and rendering time.
* **Lazy Comment Loading:** To minimize initial payload size, comments are fetched from the API only when a user explicitly expands the comment section. A boolean flag prevents duplicate network requests on subsequent toggles.
* **Base64 Image Handling:** Images are converted to base64 via the browser's `FileReader` API and stored natively in MongoDB. File size is capped at 5MB on the client, and the Express body-parser limit is increased to accommodate the base64 string overhead.
* **Flat Sub-Document Replies:** Replies are stored as an embedded array within each `Comment` document. This avoids complex recursive population queries while keeping related data co-located, perfectly matching the intended UX depth.
* **Strict Route Guarding:** `PrivateRoute` higher-order components redirect unauthenticated users to `/login`. Conversely, `PublicRoute` guards prevent logged-in users from accessing auth pages, eliminating back-button bypass bugs.

---