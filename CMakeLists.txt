cmake_minimum_required(VERSION 3.14)
project(RecommendationSystem CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ── Shared source files (all except main.cpp) ──────────────────────────────
set(LIB_SOURCES
    src/FileStorage.cpp
    src/UserDataStore.cpp
    src/CollaborativeRecommender.cpp
    src/AddCommand.cpp
    src/RecommendCommand.cpp
    src/HelpCommand.cpp
    src/CLI.cpp
)

# ── Main application ───────────────────────────────────────────────────────
add_executable(recommendation_system
    ${LIB_SOURCES}
    src/main.cpp
)

# ── Unit tests (Google Test – system package) ─────────────────────────────
find_package(GTest REQUIRED)

enable_testing()

add_executable(run_tests
    ${LIB_SOURCES}
    tests/tests.cpp
)

target_include_directories(run_tests PRIVATE src)
target_link_libraries(run_tests GTest::GTest GTest::Main)

include(GoogleTest)
gtest_discover_tests(run_tests)
