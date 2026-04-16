# Product Recommendation System

A CLI-based collaborative filtering recommendation engine written in C++17.

## Overview

When a user views a product, the system recommends up to 10 related products based on the viewing history of users with similar taste.

### Algorithm

1. **Similarity** – For the target user, compute how many products they share with every other user.
2. **Weighting** – Among users who also viewed the seed product, accumulate relevance scores for each additional product they watched, weighted by similarity.
3. **Ranking** – Return the top-10 products by descending relevance; ties are broken by ascending product ID.

## Project Structure

```
.
├── src/
│   ├── IDataStorage.h          # Persistence interface (DI / OCP)
│   ├── FileStorage.h / .cpp    # File-based persistence implementation
│   ├── IRecommender.h          # Recommender algorithm interface
│   ├── CollaborativeRecommender.h / .cpp  # Collaborative filtering implementation
│   ├── ICommandHandler.h       # Command interface (SRP / OCP)
│   ├── UserDataStore.h / .cpp  # In-memory data store with persistence
│   ├── AddCommand.h / .cpp     # Handles the `add` command
│   ├── RecommendCommand.h / .cpp # Handles the `recommend` command
│   ├── HelpCommand.h / .cpp    # Handles the `help` command
│   ├── CLI.h / .cpp            # Input dispatcher / main loop
│   └── main.cpp                # Composition root
├── tests/
│   └── tests.cpp               # Google Test unit tests
├── data/                       # Auto-created; stores userdata.txt
├── CMakeLists.txt
├── Dockerfile
└── README.md
```

## Commands

| Command | Description |
|---------|-------------|
| `add [userid] [productid1] [productid2] ...` | Record that a user viewed one or more products. Data is persisted automatically. |
| `recommend [userid] [productid]` | Print up to 10 recommended products. |
| `help` | List all available commands. |

- Fields are separated by one or more **space** characters (tabs are not supported).
- Invalid or unknown commands are **silently ignored**.
- The program **never exits** under normal operation.

## Building & Running

### Local (CMake)

```bash
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --parallel
cd ..
./build/recommendation_system
```

### Docker – Application

```bash
# Build the image
docker build -t recommendation_system .

# Run interactively (stdin for commands, data/ persisted via volume)
docker run -it --rm -v "$(pwd)/data:/app/data" recommendation_system
```

### Docker – Unit Tests

```bash
docker build -t recommendation_system .
docker run --rm recommendation_system ./run_tests
```

## Example Session

```
add 1 100 101 102 103
add 2 101 102 104 105 106
add 3 100 104 105 107 108
add 5 100 102 103 105 108 111
add 6 100 103 104 110 111 112 113
add 8 101 104 105 106 109 111 114
recommend 1 104
105 106 111 110 112 113 108 109 114
help
add [userid] [productid1] [productid2] …
recommend [userid] [productid]
help
```

## Design Principles (SOLID)

| Principle | Application |
|-----------|-------------|
| **S**ingle Responsibility | Each class has one job: `CLI` dispatches, `FileStorage` persists, `CollaborativeRecommender` scores. |
| **O**pen/Closed | New commands inherit `ICommandHandler`; new algorithms inherit `IRecommender` — no existing code changes. |
| **L**iskov Substitution | `FileStorage` can be swapped for any `IDataStorage` without breaking callers. |
| **I**nterface Segregation | Thin interfaces (`IDataStorage`, `IRecommender`, `ICommandHandler`) expose only what's needed. |
| **D**ependency Inversion | `main.cpp` wires concrete types; all other classes depend on interfaces. |

## Data Persistence

All data entered via `add` is appended to `data/userdata.txt`. On restart, the file is re-read and the full history is restored. Deleting or clearing this file is the only way to reset the system.

---
# Original