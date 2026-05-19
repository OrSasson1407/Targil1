#pragma once
#include "IDataStorage.h"
class FileStorage : public IDataStorage {
    std::string m_filePath;
public:
    explicit FileStorage(const std::string& filePath);
    void save(const std::string& userId, const std::vector<std::string>& productIds) override;
    void load(std::unordered_map<std::string, std::unordered_set<std::string>>& data) override;
};
