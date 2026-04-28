#pragma once
#include "IRecommender.h"

// Collaborative-filtering recommender.
//
// Algorithm (from assignment appendix):
//  1. For every other user compute similarity = |products(user) ∩ products(otherUser)|.
//  2. Among users who also watched the seed product, accumulate relevance scores for
//     every additional product they watched, weighted by the similarity value.
//  3. Return the top-10 products by descending relevance; ties broken by ascending product ID.
class CollaborativeRecommender : public IRecommender {
public:
    std::vector<std::string> recommend(
        const std::string& userId,
        const std::string& productId,
        const std::unordered_map<std::string,
              std::unordered_set<std::string>>& userData) const override;
};