#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>

// Interface for data persistence (Dependency Inversion Principle).
// Swapping storage backends (file, DB, network) requires only a new implementation.
class IDataStorage {
public:
    virtual ~IDataStorage() = default;

    // Persist a user -> products mapping. May be called multiple times for the same user.
    virtual void save(const std::string& userId,
                      const std::vector<std::string>& productIds) = 0;

    // Load all user data into the provided map (userId -> set of productIds).
    virtual void load(std::unordered_map<std::string,
                      std::unordered_set<std::string>>& data) = 0;
};