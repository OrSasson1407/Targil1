#include "CLI.h"
#include "FileStorage.h"
#include "UserDataStore.h"
#include "CollaborativeRecommender.h"
#include "AddCommand.h"
#include "RecommendCommand.h"
#include "HelpCommand.h"
#include <iostream>
#include <memory>

int main() {
    // --- Composition Root ---
    // All dependencies are wired here. Swapping implementations (e.g. a DB storage
    // or a different recommender) requires only changes in this function.

    const std::string dataFile = "data/userdata.txt";

    auto storage     = std::make_shared<FileStorage>(dataFile);
    auto store       = std::make_shared<UserDataStore>(storage);
    auto recommender = std::make_shared<CollaborativeRecommender>();

    CLI cli(std::cin);
    cli.registerCommand(std::make_shared<AddCommand>(store));
    cli.registerCommand(std::make_shared<RecommendCommand>(store, recommender, std::cout));
    cli.registerCommand(std::make_shared<HelpCommand>(std::cout));

    cli.run();  // runs forever as per spec
    return 0;
}