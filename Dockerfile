# ── Build stage ───────────────────────────────────────────────────────────────
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    libssl-dev \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

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
