#pragma once
#include "IRecommender.h"
class CollaborativeRecommender : public IRecommender {
public:
    std::vector<std::string> recommend(const std::string& userId, const std::string& productId, const std::unordered_map<std::string, std::unordered_set<std::string>>& userData) const override;
};
