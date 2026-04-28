# ── Build stage ───────────────────────────────────────────────────────────────
FROM ubuntu:22.04 AS builder

# Install build tools and Google Test source
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    libgtest-dev \
    && rm -rf /var/lib/apt/lists/*

# Compile Google Test so CMake can find it globally
RUN cd /usr/src/gtest && cmake CMakeLists.txt && make && cp lib/*.a /usr/lib

WORKDIR /app
COPY . .

RUN mkdir -p build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    cmake --build . --parallel

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM ubuntu:22.04

WORKDIR /app

# Copy built binaries
COPY --from=builder /app/build/recommendation_system .
COPY --from=builder /app/build/run_tests .

# Create data directory for persistence
RUN mkdir -p data

# Default: run the app
CMD ["./recommendation_system"]