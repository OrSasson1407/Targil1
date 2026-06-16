# 🍔 Food Delivery – Full Stack Project

A multi-exercise project built across four exercises, combining a C++ recommendation engine, a Node.js REST API, and a React web application.

---

## 🌿 Branch Guide

| Branch | Exercise | Description |
|---|---|---|
| `SCRUM-29-my-feature` | **EX1** | C++ CLI collaborative filtering recommendation engine |
| `SCRUM-38-Targil-2` | **EX2** | C++ TCP server wrapping the EX1 recommendation engine |
| `main` | **EX3 + EX4** | Node.js/Express REST API (EX3) + React web application (EX4) |

> To switch branches: `git checkout <branch-name>`

---

## 🚀 Quick Start — EX3 + EX4 + EX2 (Full Stack, Recommended)

This is the standard way to run everything together. One command starts all services:

```bash
docker-compose up --build
```

Then open your browser at:

```
http://localhost:3000
```

The React app loads automatically. The Node.js API runs on port `3000`, and the C++ recommendation server runs internally on port `5555`.

To stop all services:

```bash
docker-compose down
```

---

## 🐳 Docker Compose — Full Architecture

The `docker-compose.yml` defines two services:

```
┌─────────────────────────────────────────────────────┐
│                   docker-compose                    │
│                                                     │
│  ┌──────────────────┐    ┌────────────────────────┐ │
│  │   web-server     │    │     ex2-server         │ │
│  │  (Node.js + React│───▶│  (C++ TCP server)      │ │
│  │   port: 3000)    │    │   port: 5555 (internal)│ │
│  └──────────────────┘    └────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         ▲
         │  http://localhost:3000
         │  (browser)
```

| Service | Description | Port |
|---|---|---|
| `web-server` | Node.js Express API + serves the built React app | `3000` |
| `ex2-server` | C++ recommendation TCP server | `5555` (internal only) |

The `web-server` depends on `ex2-server` and connects to it automatically via the Docker internal network.

---

## 📋 Exercise Breakdown & Running Instructions

---

### EX4 — React Web Application

**Branch:** `main`

The React app is built automatically as part of the Docker image (multi-stage build). Vite compiles it into static files which are served by the Node.js server.

#### Run with Docker (recommended):

```bash
docker-compose up --build
```

Open: [http://localhost:3000](http://localhost:3000)

#### Run locally (development mode with hot reload):

Requires Node.js 20+ and the EX3 server already running on port `3000`.

```bash
# Terminal 1 — start the backend
npm install
node index.js

# Terminal 2 — start the React dev server
cd client
npm install
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

> The Vite dev server proxies all `/api` requests to `http://localhost:3000` automatically.

#### Build the React app manually (without Docker):

```bash
cd client
npm install
npm run build
```

The compiled output will be in `client/dist/`. The Node.js server serves this folder at `/`.

---

### EX3 — Node.js REST API

**Branch:** `main`

#### Run with Docker Compose (starts EX2 automatically):

```bash
docker-compose up --build
```

#### Run locally (EX2 must already be running on port 5555):

```bash
npm install
node index.js
```

#### Environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the web server |
| `EX2_HOST` | `127.0.0.1` | Host of the C++ recommendation server |
| `EX2_PORT` | `5555` | Port of the C++ recommendation server |
| `JWT_SECRET` | `wolt_dev_secret_1234` | Secret for signing JWT tokens |

---

### EX2 — C++ TCP Recommendation Server

**Branch:** `SCRUM-38-Targil-2`

```bash
git checkout SCRUM-38-Targil-2
```

#### Run with Docker:

```bash
docker build -t ex2-server -f Dockerfile.ex2 .
docker run -it --rm -p 5555:5555 ex2-server ./server 5555
```

#### Run locally (requires CMake and a C++17 compiler):

```bash
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --parallel
cd ..
./build/server 5555
```

---

### EX1 — C++ CLI Recommendation Engine

**Branch:** `SCRUM-29-my-feature`

```bash
git checkout SCRUM-29-my-feature
```

#### Run with Docker:

```bash
docker build -t recommendation_system .
docker run -it --rm -v "$(pwd)/data:/app/data" recommendation_system

# Run tests:
docker run --rm recommendation_system ./run_tests
```

#### Run locally:

```bash
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --parallel
cd ..
./build/recommendation_system
```

#### Run tests locally:

```bash
cd build
ctest --output-on-failure
```

---

## 🌐 API Endpoints (EX3 / EX4)

Base URL: `http://localhost:3000/api`

> All endpoints marked 🔒 require a `Bearer <token>` Authorization header.

### Users & Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users` | ❌ | Register a new user |
| `GET` | `/users/:id` | 🔒 | Get user profile |
| `POST` | `/tokens` | ❌ | Login — returns JWT token |

### Restaurants

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/restaurants` | ❌ | List all restaurants |
| `POST` | `/restaurants` | 🔒 | Create a restaurant |
| `GET` | `/restaurants/:id` | ❌ | Get restaurant by ID |
| `PATCH` | `/restaurants/:id` | 🔒 | Update restaurant |
| `DELETE` | `/restaurants/:id` | 🔒 | Delete restaurant (cascades to products) |

### Products (Menu Items)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/restaurants/:id/products` | ❌ | List all products |
| `POST` | `/restaurants/:id/products` | 🔒 | Add a product |
| `GET` | `/restaurants/:id/products/:pId` | ❌ | Get product (also records view in EX2) |
| `PATCH` | `/restaurants/:id/products/:pId` | 🔒 | Update a product |
| `DELETE` | `/restaurants/:id/products/:pId` | 🔒 | Delete a product |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/orders` | 🔒 | Place an order |
| `GET` | `/orders` | 🔒 | Get all orders for logged-in user |
| `GET` | `/orders/:id` | 🔒 | Get order by ID |
| `PATCH` | `/orders/:id` | 🔒 | Update order |
| `DELETE` | `/orders/:id` | 🔒 | Delete order |

### Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/search/:query` | ❌ | Search restaurants and products |

---

## 📁 Project Structure

```
.
├── index.js                        # Entry point — starts the Node.js server
├── src/
│   ├── app.js                      # Express app factory
│   ├── routes/
│   │   └── api.js                  # All API route definitions
│   ├── controllers/                # Request handlers
│   │   ├── usersController.js
│   │   ├── tokensController.js
│   │   ├── restaurantsController.js
│   │   ├── productsController.js
│   │   ├── ordersController.js
│   │   └── searchController.js
│   ├── models/
│   │   └── store.js                # In-memory data store
│   ├── services/
│   │   └── ex2Client.js            # TCP client to the C++ EX2 server
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── CLI.h / CLI.cpp             # C++ EX1/EX2 source
│   ├── Commands.h / Commands.cpp
│   ├── CollaborativeRecommender.h / .cpp
│   ├── FileStorage.h / .cpp
│   └── UserDataStore.h / .cpp
├── client/                         # React app (EX4)
│   ├── src/
│   │   ├── App.jsx                 # Router + theme
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Main feed, search, categories
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── RestaurantPage.jsx  # Menu + cart
│   │   │   ├── OrdersPage.jsx      # Order history
│   │   │   └── ManagePage.jsx      # Restaurant management
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── RestaurantCard.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # JWT + user state
│   │   │   └── CartContext.jsx     # Shopping cart state
│   │   └── api/
│   │       └── index.js            # Fetch wrappers (apiGet, apiPost, ...)
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── userdata.txt                # C++ persistent storage
├── tests/
│   └── tests.cpp                   # Google Test unit tests
├── CMakeLists.txt
├── Dockerfile                      # Multi-stage: builds React + Node.js
├── docker-compose.yml
└── package.json
```

---

## ⚙️ Recommendation Algorithm (EX1 / EX2)

The C++ engine uses **collaborative filtering**:

1. Compute similarity between the target user and all others (by count of shared products viewed).
2. For users who also viewed the seed product, accumulate their similarity score across their other viewed products.
3. Return the top 10 products by descending score; ties broken by ascending product ID.

### EX2 TCP Protocol

| Command | Description |
|---|---|
| `POST <userId> <productId...>` | Register user with product(s) |
| `PATCH <userId> <productId...>` | Append product(s) to user history |
| `DELETE <userId> <productId...>` | Remove product(s) from user history |
| `GET <userId> <productId>` | Get recommendations |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| EX1 / EX2 | C++17, CMake, Google Test |
| EX3 | Node.js 20, Express 5, jsonwebtoken, uuid |
| EX4 | React 19, React Router 7, Vite 8 |
| Infrastructure | Docker, docker-compose |
| Data | In-memory store (resets on restart); file-based persistence for C++ layer |

---

## 👤 Author

Or Sasson – [GitHub](https://github.com/OrSasson1407/Targil1)