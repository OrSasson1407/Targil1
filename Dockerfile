FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y cmake build-essential libgtest-dev python3 && rm -rf /var/lib/apt/lists/*

RUN cd /usr/src/gtest && cmake CMakeLists.txt && make && cp lib/*.a /usr/lib

WORKDIR /app

COPY . .

RUN echo "===== FILES =====" && ls -R

RUN mkdir -p build && cd build && cmake .. -DCMAKE_BUILD_TYPE=Release && cmake --build . --parallel

FROM ubuntu:22.04

RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/build/recommendation_system .
COPY --from=builder /app/build/run_tests .
COPY --from=builder /app/src/client.py .

RUN mkdir -p data

CMD ["./recommendation_system", "8080"]
