#include "RecommendCommand.h"

RecommendCommand::RecommendCommand(std::shared_ptr<UserDataStore> store,
                                   std::shared_ptr<IRecommender> recommender,
                                   std::ostream& output)
    : m_store(std::move(store))
    , m_recommender(std::move(recommender))
    , m_output(output) {}

std::string RecommendCommand::commandName() const {
    return "recommend";
}

// args = { userId, productId }
// Invalid (returns false) if not exactly 2 tokens.
bool RecommendCommand::execute(const std::vector<std::string>& args) {
    if (args.size() != 2) return false;

    const std::string& userId    = args[0];
    const std::string& productId = args[1];

    std::vector<std::string> recs =
        m_recommender->recommend(userId, productId, m_store->getData());

    // Print recommendations space-separated on one line
    for (size_t i = 0; i < recs.size(); ++i) {
        if (i > 0) m_output << ' ';
        m_output << recs[i];
    }
    if (!recs.empty()) m_output << '\n';

    return true;
}
