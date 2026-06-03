# Food Delivery – Full Stack Project

A multi-exercise project built across three branches, combining a C++ recommendation server with a Node.js/Express RESTful API for a food delivery application.

---

## 🌿 Branch Guide

| Branch | Exercise | Description |
|---|---|---|
| `SCRUM-29-my-feature` |  **EX1** | C++ CLI-based collaborative filtering recommendation engine |
| `SCRUM-38-Targil-2` | **EX2** | C++ TCP server wrapping the EX1 recommendation engine |
| `main` | **EX3** | Node.js/Express RESTful food delivery server, integrates with EX2 |

> To switch branches: `git checkout <branch-name>`

---

## 🚀 How to Run

### EX3 (main) + EX2 together — Docker Compose (recommended)

This is the standard way to run the full stack. It starts both the Node.js web server and the C++ recommendation server.

```bash
docker-compose up --build
```

- Web server → [http://localhost:3000](http://localhost:3000)
- C++ recommendation server → `localhost:5555` (internal, used by EX3)

To stop:
```bash
docker-compose down
```

---

### EX3 (main) — Node.js only (local)

Requires the EX2 server to already be running on port `5555`.

```bash
npm install
node index.js
```

Environment variables (optional):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the web server |
| `EX2_HOST` | `127.0.0.1` | Host of the C++ recommendation server |
| `EX2_PORT` | `5555` | Port of the C++ recommendation server |

---

### EX2 (the-other) — C++ TCP Server (local)

```bash
git checkout the-other
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --parallel
cd ..
./build/server 5555
```

Or with Docker:

```bash
docker build -t ex2-server .
docker run -it --rm -p 5555:5555 ex2-server ./server 5555
```

---

### EX1 (myfeature-ex1) — C++ CLI (local)

```bash
git checkout myfeature-ex1
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --parallel
cd ..
./build/recommendation_system
```

Run tests:
```bash
cd build && ctest --output-on-failure
```

Or with Docker:
```bash
docker build -t recommendation_system .
docker run -it --rm -v "$(pwd)/data:/app/data" recommendation_system
# To run tests:
docker run --rm recommendation_system ./run_tests
```

---

## 📁 Project Structure

```
.
├── index.js                    # Entry point – starts the web server
├── src/
│   ├── app.js                  # Express app factory
│   ├── main.cpp                # C++ server entry point (EX2)
│   ├── routes/
│   │   └── api.js              # All API route definitions
│   ├── controllers/            # Request handlers (MVC)
│   │   ├── usersController.js
│   │   ├── tokensController.js
│   │   ├── restaurantsController.js
│   │   ├── productsController.js
│   │   ├── ordersController.js
│   │   └── searchController.js
│   ├── models/
│   │   └── store.js            # In-memory data store (users, restaurants, products, orders)
│   ├── services/
│   │   └── ex2Client.js        # TCP client to communicate with the C++ EX2 server
│   ├── middleware/
│   │   └── errorHandler.js     # 404 + global error handler
│   ├── CLI.h / CLI.cpp         # C++ input dispatcher
│   ├── Commands.h / Commands.cpp
│   ├── CollaborativeRecommender.h / .cpp
│   ├── FileStorage.h / .cpp
│   ├── UserDataStore.h / .cpp
│   └── client.py               # Python test client
├── tests/
│   └── tests.cpp               # Google Test unit tests (C++)
├── data/
│   └── userdata.txt            # Auto-created; persists user/product data
├── Dockerfile
├── docker-compose.yml
├── CMakeLists.txt
└── package.json
```

---

## 🌐 API Endpoints (EX3)

Base URL: `http://localhost:3000/api`

### Users
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users` | Register a new user |
| `GET` | `/users/:id` | Get user by ID |

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tokens` | Login (returns token) |

### Restaurants
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/restaurants` | List all restaurants |
| `POST` | `/restaurants` | Create a restaurant |
| `GET` | `/restaurants/:id` | Get restaurant by ID |
| `PATCH` | `/restaurants/:id` | Update restaurant |
| `DELETE` | `/restaurants/:id` | Delete restaurant (cascades to products) |

### Products (Menu Items)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/restaurants/:id/products` | List all products of a restaurant |
| `POST` | `/restaurants/:id/products` | Add a product |
| `GET` | `/restaurants/:id/products/:pId` | Get a product (also records view in EX2) |
| `PATCH` | `/restaurants/:id/products/:pId` | Update a product |
| `DELETE` | `/restaurants/:id/products/:pId` | Delete a product |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Create an order |
| `GET` | `/orders` | Get all orders for logged-in user |
| `GET` | `/orders/:id` | Get order by ID |
| `PATCH` | `/orders/:id` | Update order |
| `DELETE` | `/orders/:id` | Delete order |

### Search
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search/:query` | Search restaurants and products by name/type |

---

## ⚙️ EX1 / EX2 – Recommendation Algorithm

The C++ engine uses **collaborative filtering**:

1. Compute similarity between the target user and all others (by count of shared products).
2. For users who also viewed the seed product, add their similarity score to each other product they viewed.
3. Return the top 10 products by descending score; ties broken by ascending product ID.

### EX2 TCP Protocol

The Node.js server (EX3) communicates with the C++ server (EX2) via a line-based TCP protocol:

| Command | Description |
|---|---|
| `POST <userId> <productId...>` | Register user with product(s) |
| `PATCH <userId> <productId...>` | Append product(s) to user history |
| `DELETE <userId> <productId...>` | Remove product(s) from user history |
| `GET <userId> <productId>` | Get recommendations |

---

## 🛠️ Tech Stack

- **EX1 / EX2:** C++17, CMake, Google Test, Docker
- **EX3:** Node.js, Express 5, UUID, Docker, docker-compose
- **Data:** In-memory store (resets on restart), file-based persistence for C++ layer

---

## 👤 Author

Or Sasson – [GitHub](https://github.com/OrSasson1407/Targil1)
