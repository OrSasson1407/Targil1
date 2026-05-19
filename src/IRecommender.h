#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
class IRecommender {
public:
    virtual ~IRecommender() = default;
    virtual std::vector<std::string> recommend(const std::string& userId, const std::string& productId, const std::unordered_map<std::string, std::unordered_set<std::string>>& userData) const = 0;
};
