#include "AddCommand.h"

AddCommand::AddCommand(std::shared_ptr<UserDataStore> store)
    : m_store(std::move(store)) {}

std::string AddCommand::commandName() const {
    return "add";
}

// args = { userId, productId1, productId2, ... }
// Invalid (returns false) if fewer than 2 tokens (needs at least userId + 1 product).
bool AddCommand::execute(const std::vector<std::string>& args) {
    if (args.size() < 2) return false;

    const std::string& userId = args[0];
    std::vector<std::string> products(args.begin() + 1, args.end());
    m_store->addProducts(userId, products);
    return true;
}
