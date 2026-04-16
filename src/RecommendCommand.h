#pragma once
#include "ICommandHandler.h"
#include "UserDataStore.h"
#include "IRecommender.h"
#include <memory>
#include <ostream>

// Handles: recommend [userid] [productid]
// Prints up to 10 recommended product IDs separated by spaces, followed by a newline.
class RecommendCommand : public ICommandHandler {
public:
    RecommendCommand(std::shared_ptr<UserDataStore> store,
                     std::shared_ptr<IRecommender> recommender,
                     std::ostream& output);

    std::string commandName() const override;
    bool execute(const std::vector<std::string>& args) override;

private:
    std::shared_ptr<UserDataStore>  m_store;
    std::shared_ptr<IRecommender>   m_recommender;
    std::ostream&                   m_output;
};
