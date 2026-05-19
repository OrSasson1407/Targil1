cmake_minimum_required(VERSION 3.14)

project(RecommendationSystem CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(SRC_FILES
    src/FileStorage.cpp
    src/UserDataStore.cpp
    src/CollaborativeRecommender.cpp
    src/Commands.cpp
    src/CLI.cpp
)

# MAIN APP
add_executable(recommendation_system
    src/main.cpp
    ${SRC_FILES}
)

# TESTS
find_package(GTest REQUIRED)
enable_testing()

add_executable(run_tests
    tests/tests.cpp
    ${SRC_FILES}   # 🔥 זה החלק שחסר לך
)

target_include_directories(run_tests PRIVATE src)

target_link_libraries(run_tests
    GTest::GTest
    GTest::Main
    pthread
)

include(GoogleTest)
gtest_discover_tests(run_tests)