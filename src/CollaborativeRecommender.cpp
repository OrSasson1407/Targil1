#include "CollaborativeRecommender.h"
#include <algorithm>
std::vector<std::string> CollaborativeRecommender::recommend(const std::string& userId, const std::string& productId, const std::unordered_map<std::string, std::unordered_set<std::string>>& userData) const {
    const std::unordered_set<std::string>* userProducts = nullptr;
    auto itUser = userData.find(userId);
    if (itUser != userData.end()) userProducts = &itUser->second;
    std::unordered_map<std::string, int> similarity;
    for (const auto& [otherUser, otherProducts] : userData) {
        if (otherUser == userId) continue;
        int common = 0;
        if (userProducts) {
            for (const auto& pid : *userProducts) if (otherProducts.count(pid)) ++common;
        }
        similarity[otherUser] = common;
    }
    std::unordered_map<std::string, int> relevance;
    for (const auto& [otherUser, otherProducts] : userData) {
        if (otherUser == userId) continue;
        if (!otherProducts.count(productId)) continue;
        int sim = similarity[otherUser];
        for (const auto& pid : otherProducts) {
            if (pid == productId) continue;
            if (userProducts && userProducts->count(pid)) continue;
            relevance[pid] += sim;
        }
    }
    std::vector<std::pair<std::string, int>> candidates(relevance.begin(), relevance.end());
    std::sort(candidates.begin(), candidates.end(), [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    std::vector<std::string> result;
    for (size_t i = 0; i < candidates.size() && i < 10; ++i) result.push_back(candidates[i].first);
    return result;
}
