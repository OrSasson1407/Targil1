# 🍔 Food Delivery – Full Stack Project

A multi-exercise project built across five exercises, combining a C++ recommendation engine, a Node.js REST API, a React web application, and a React Native mobile app backed by MongoDB.

---

## 🌿 Branch Guide

| Branch | Exercise | Description |
|---|---|---|
| `SCRUM-29-my-feature` | **EX1** | C++ CLI collaborative filtering recommendation engine |
| `SCRUM-38-Targil-2` | **EX2** | C++ TCP server wrapping the EX1 recommendation engine |
| `ex3` | **EX3** | Node.js/Express REST API |
| `ex4` | **EX4** | React web application |
| `main` | **EX5** | React Native mobile app (Expo) + MongoDB persistence |

> To switch branches: `git checkout <branch-name>`

---

## 🚀 Quick Start — EX5 (Full Stack, Recommended)

This is the standard way to run the entire backend stack. One command starts all services:

```bash
docker-compose up --build
```

Then, in a separate terminal, start the mobile app:

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your physical device, or press `a` for Android emulator / `i` for iOS simulator.

To stop the backend:

```bash
docker-compose down
```

---

## 🐳 Docker Compose — Full Architecture (EX5)

The `docker-compose.yml` defines three services:

```
┌─────────────────────────────────────────────────────────────────┐
│                        docker-compose                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │    mongo     │◀───│   web-server     │───▶│  ex2-server   │ │
│  │  (MongoDB 7) │    │ (Node.js + React │    │ (C++ TCP)     │ │
│  │  port: 27017 │    │   port: 3000)    │    │ port: 5555    │ │
│  └──────────────┘    └──────────────────┘    └───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               ▲
                               │  http://<LAN_IP>:3000/api
                               │  (Expo mobile app)
```

| Service | Description | Port |
|---|---|---|
| `mongo` | MongoDB 7 – persistent data store | `27017` (internal + exposed) |
| `web-server` | Node.js Express API + serves the built React app | `3000` |
| `ex2-server` | C++ recommendation TCP server | `5555` (internal only) |

---

## 📋 Exercise Breakdown & Running Instructions

---

### EX5 — React Native Mobile App + MongoDB

**Branch:** `main`

The mobile app is built with **Expo** (file-based routing via `expo-router`) and connects to the same Node.js backend as EX4. The Node.js server was updated to persist all data in **MongoDB** instead of the in-memory store.

#### Run the backend (Docker):

```bash
docker-compose up --build
```

#### Run the mobile app:

```bash
cd mobile
npm install
npx expo start
```

Then:
- **Android emulator**: press `a` (set `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api`)
- **iOS simulator**: press `i` (set `EXPO_PUBLIC_API_URL=http://localhost:3000/api`)
- **Physical device**: scan QR code (set `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:3000/api`)

Create a `.env` file inside `mobile/`:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:3000/api
```

#### Mobile app screens:

| Screen | Description |
|---|---|
| Home | Restaurant feed, search, categories |
| Restaurant | Menu items, add to cart |
| Cart | Cart drawer, place order |
| Orders | Order history |
| Manage | Create / edit / delete restaurants and products |
| Login | JWT-based authentication with validation |
| Register | Registration with image picker and input validation |
| Profile | Logged-in user info, logout |

#### MongoDB (EX5 change from EX3):

The Node.js server now uses **Mongoose** to persist all data in MongoDB. The `MONGO_URI` environment variable is set automatically by Docker Compose:

```
MONGO_URI=mongodb://mongo:27017/wolt
```

Data survives server restarts via the `mongo_data` Docker volume.

#### Environment variables (EX5 additions):

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://mongo:27017/wolt` | MongoDB connection string |
| `PORT` | `3000` | Port for the web server |
| `EX2_HOST` | `ex2-server` | Host of the C++ recommendation server |
| `EX2_PORT` | `5555` | Port of the C++ recommendation server |
| `JWT_SECRET` | `wolt_dev_secret_1234` | Secret for signing JWT tokens |

#### Mobile tech stack:

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.0.34 | App runtime and toolchain |
| `expo-router` | ~6.0.24 | File-based navigation |
| `react-native` | 0.81.5 | Core framework |
| `@react-navigation/bottom-tabs` | ^7.18.3 | Bottom tab navigator |
| `@react-navigation/native-stack` | ^7.17.6 | Stack navigation |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistent token storage |
| `expo-image-picker` | ~17.0.11 | Camera / gallery image selection |
| `react-native-reanimated` | ^3.16.7 | Animations |
| `react-native-gesture-handler` | ~2.28.0 | Gesture support |

---

### EX4 — React Web Application

**Branch:** `ex4`

The React app is built automatically as part of the Docker image (multi-stage build). Vite compiles it into static files served by the Node.js server.

#### Run with Docker (recommended):

```bash
git checkout ex4
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

**Branch:** `ex3`

#### Run with Docker Compose (starts EX2 automatically):

```bash
git checkout ex3
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

## 🌐 API Endpoints (EX3 / EX4 / EX5)

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
│   │   └── store.js                # Mongoose models (EX5: replaces in-memory store)
│   ├── services/
│   │   └── ex2Client.js            # TCP client to the C++ EX2 server
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── CLI.h / CLI.cpp             # C++ EX1/EX2 source
│   ├── Commands.h / Commands.cpp
│   ├── CollaborativeRecommender.h / .cpp
│   ├── FileStorage.h / .cpp
│   └── UserDataStore.h / .cpp
├── client/                         # React web app (EX4)
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
├── mobile/                         # React Native mobile app (EX5)
│   ├── app/
│   │   ├── _layout.js              # Root layout (AuthContext, CartContext)
│   │   ├── index.js                # Redirect to home or auth
│   │   ├── (tabs)/
│   │   │   ├── _layout.js          # Bottom tab navigator
│   │   │   ├── home.js             # Restaurant feed, search
│   │   │   ├── orders.js           # Order history
│   │   │   ├── manage.js           # Restaurant/product management
│   │   │   └── profile.js          # User profile, logout
│   │   ├── auth/
│   │   │   ├── login.js            # Login screen with validation
│   │   │   └── register.js         # Register screen with image picker
│   │   └── restaurant/
│   │       └── [id].js             # Restaurant detail + cart
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js            # API wrappers using EXPO_PUBLIC_API_URL
│   │   ├── components/
│   │   │   └── colors.js           # Wolt-inspired color palette
│   │   └── context/
│   │       ├── AuthContext.js      # JWT + AsyncStorage persistence
│   │       └── CartContext.js      # Shopping cart state
│   ├── assets/                     # App icons and splash screen
│   ├── App.js                      # App entry point
│   ├── app.json                    # Expo configuration
│   └── package.json
├── data/
│   └── userdata.txt                # C++ persistent storage
├── tests/
│   └── tests.cpp                   # Google Test unit tests
├── CMakeLists.txt
├── Dockerfile                      # Multi-stage: builds React + Node.js
├── Dockerfile.ex2                  # C++ TCP server image
├── docker-compose.yml              # mongo + ex2-server + web-server
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
| EX5 (mobile) | React Native 0.81, Expo ~54, expo-router ~6 |
| EX5 (database) | MongoDB 7, Mongoose |
| Infrastructure | Docker, docker-compose |

---

## 👤 Author

Or Sasson – [GitHub](https://github.com/OrSasson1407/Targil1)
