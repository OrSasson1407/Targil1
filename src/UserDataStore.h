#pragma once
#include "IDataStorage.h"
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include <vector>

// In-memory store for user->product data.
// Delegates persistence to an IDataStorage implementation.
class UserDataStore {
public:
    explicit UserDataStore(std::shared_ptr<IDataStorage> storage);

    // Add products for a user (merges with existing data) and persist.
    void addProducts(const std::string& userId,
                     const std::vector<std::string>& productIds);

    // Read-only access to the full data map.
    const std::unordered_map<std::string,
          std::unordered_set<std::string>>& getData() const;

private:
    std::shared_ptr<IDataStorage> m_storage;
    std::unordered_map<std::string, std::unordered_set<std::string>> m_data;
};