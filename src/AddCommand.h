#pragma once
#include "ICommandHandler.h"
#include "UserDataStore.h"
#include <memory>

// Handles: add [userid] [productid1] [productid2] ...
// Requires at least one productId after the userId.
class AddCommand : public ICommandHandler {
public:
    explicit AddCommand(std::shared_ptr<UserDataStore> store);

    std::string commandName() const override;
    bool execute(const std::vector<std::string>& args) override;

private:
    std::shared_ptr<UserDataStore> m_store;
};