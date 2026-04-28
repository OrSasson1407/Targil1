#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>

// Interface for recommendation algorithms (Open/Closed Principle).
// New algorithms can be added without modifying existing code.
class IRecommender {
public:
    virtual ~IRecommender() = default;

    // Return up to 10 recommended product IDs for the given user and seed product.
    virtual std::vector<std::string> recommend(
        const std::string& userId,
        const std::string& productId,
        const std::unordered_map<std::string,
              std::unordered_set<std::string>>& userData) const = 0;
};