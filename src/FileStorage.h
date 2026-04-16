#pragma once
#include "IDataStorage.h"
#include <string>

// Concrete file-based storage implementation.
// Persists data as lines: "userId productId1 productId2 ..." in the data/ directory.
class FileStorage : public IDataStorage {
public:
    explicit FileStorage(const std::string& filePath);

    void save(const std::string& userId,
              const std::vector<std::string>& productIds) override;

    void load(std::unordered_map<std::string,
              std::unordered_set<std::string>>& data) override;

private:
    std::string m_filePath;
};
