Product Recommendation System
A CLI-based collaborative filtering recommendation engine in C++17.
Project Structure
.
├── src/                        # All source files (.h + .cpp for each class)
│   ├── main.cpp                # Composition root
│   ├── CLI.h / .cpp            # Input dispatcher
│   ├── ICommandHandler.h       # Command interface
│   ├── AddCommand.h / .cpp     # Handles `add`
│   ├── RecommendCommand.h / .cpp  # Handles `recommend`
│   ├── HelpCommand.h / .cpp    # Handles `help`
│   ├── IDataStorage.h          # Persistence interface
│   ├── FileStorage.h / .cpp    # File-based persistence
│   ├── IRecommender.h          # Algorithm interface
│   ├── CollaborativeRecommender.h / .cpp  # Collaborative filtering
│   └── UserDataStore.h / .cpp  # In-memory store
├── tests/
│   └── tests.cpp               # Google Test unit tests
├── data/
│   └── userdata.txt            # Auto-created; persists all add commands
├── CMakeLists.txt
├── Dockerfile
└── details.txt
Commands
CommandDescriptionadd [userid] [productid1] [productid2] ...Record products a user viewed. Auto-saved to disk.recommend [userid] [productid]Print up to 10 recommended products.helpList all commands.

Fields separated by one or more spaces (no tabs).
Invalid/unknown commands are silently ignored.
The program never exits.

Algorithm

Compute similarity between the target user and all others (# shared products).
For users who also watched the seed product, add their similarity score to each other product they watched.
Return top-10 by descending score; ties broken by ascending product ID.

Example Session
add 1 100 101 102 103
add 2 101 102 104 105 106
add 3 100 104 105 107 108
recommend 1 104
105 106 107 108
help
add [userid] [productid1] [productid2] …
recommend [userid] [productid]
help
Building & Running
Local
bashmkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --parallel
cd .. && ./build/recommendation_system
Docker — App
bashdocker build -t recommendation_system .
docker run -it --rm -v "$(pwd)/data:/app/data" recommendation_system
Docker — Tests
bashdocker build -t recommendation_system .
docker run --rm recommendation_system ./run_tests