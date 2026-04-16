#include "CollaborativeRecommender.h"
#include <algorithm>
#include <unordered_map>
#include <vector>

std::vector<std::string> CollaborativeRecommender::recommend(
    const std::string& userId,
    const std::string& productId,
    const std::unordered_map<std::string,
          std::unordered_set<std::string>>& userData) const {

    // Retrieve the current user's product set (may be empty if unknown user)
    const std::unordered_set<std::string>* userProducts = nullptr;
    auto itUser = userData.find(userId);
    if (itUser != userData.end()) {
        userProducts = &itUser->second;
    }

    // Step 1 – compute similarity between userId and every other user.
    // similarity(u1, u2) = number of products in common
    std::unordered_map<std::string, int> similarity;   // otherUserId -> sim score
    for (const auto& [otherUser, otherProducts] : userData) {
        if (otherUser == userId) continue;

        int common = 0;
        if (userProducts) {
            for (const auto& pid : *userProducts) {
                if (otherProducts.count(pid)) ++common;
            }
        }
        similarity[otherUser] = common;
    }

    // Step 2 – for every user who watched the seed product,
    // add their similarity weight to each additional product they watched.
    std::unordered_map<std::string, int> relevance;  // candidateProductId -> total weight

    for (const auto& [otherUser, otherProducts] : userData) {
        if (otherUser == userId) continue;
        if (!otherProducts.count(productId)) continue;  // didn't watch seed product

        int sim = similarity[otherUser];
        for (const auto& pid : otherProducts) {
            // Exclude the seed product and products the current user already watched
            if (pid == productId) continue;
            if (userProducts && userProducts->count(pid)) continue;

            relevance[pid] += sim;
        }
    }

    // Step 3 – sort candidates: descending relevance, ties by ascending product ID.
    std::vector<std::pair<std::string, int>> candidates(relevance.begin(), relevance.end());
    std::sort(candidates.begin(), candidates.end(),
        [](const std::pair<std::string, int>& a,
           const std::pair<std::string, int>& b) {
            if (a.second != b.second) return a.second > b.second;  // higher relevance first
            return a.first < b.first;                               // ties: ascending product ID
        });

    // Return at most 10 recommendations
    std::vector<std::string> result;
    result.reserve(std::min<size_t>(10, candidates.size()));
    for (size_t i = 0; i < candidates.size() && i < 10; ++i) {
        result.push_back(candidates[i].first);
    }
    return result;
}
