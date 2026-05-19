#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
class IDataStorage {
public:
    virtual ~IDataStorage() = default;
    virtual void save(const std::string& userId, const std::vector<std::string>& productIds) = 0;
    virtual void load(std::unordered_map<std::string, std::unordered_set<std::string>>& data) = 0;
};
