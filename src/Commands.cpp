#include "Commands.h"
#include <sstream>
PostCommand::PostCommand(std::shared_ptr<UserDataStore> store) : m_store(std::move(store)) {}
std::string PostCommand::commandName() const { return "POST"; }
std::string PostCommand::execute(const std::vector<std::string>& args) {
    if (args.size() < 2) return "400 Bad Request\n";
    if (m_store->userExists(args[0])) return "404 Not Found\n";
    m_store->addProducts(args[0], std::vector<std::string>(args.begin() + 1, args.end())); return "201 Created\n";
}
PatchCommand::PatchCommand(std::shared_ptr<UserDataStore> store) : m_store(std::move(store)) {}
std::string PatchCommand::commandName() const { return "PATCH"; }
std::string PatchCommand::execute(const std::vector<std::string>& args) {
    if (args.size() < 2) return "400 Bad Request\n";
    if (!m_store->userExists(args[0])) return "404 Not Found\n";
    m_store->addProducts(args[0], std::vector<std::string>(args.begin() + 1, args.end())); return "204 No Content\n";
}
DeleteCommand::DeleteCommand(std::shared_ptr<UserDataStore> store) : m_store(std::move(store)) {}
std::string DeleteCommand::commandName() const { return "DELETE"; }
std::string DeleteCommand::execute(const std::vector<std::string>& args) {
    if (args.size() < 2) return "400 Bad Request\n";
    if (!m_store->userExists(args[0])) return "404 Not Found\n";
    m_store->removeProducts(args[0], std::vector<std::string>(args.begin() + 1, args.end())); return "204 No Content\n";
}
GetCommand::GetCommand(std::shared_ptr<UserDataStore> store, std::shared_ptr<IRecommender> recommender) : m_store(std::move(store)), m_recommender(std::move(recommender)) {}
std::string GetCommand::commandName() const { return "GET"; }
std::string GetCommand::execute(const std::vector<std::string>& args) {
    if (args.size() != 2) return "400 Bad Request\n";
    if (!m_store->userExists(args[0])) return "404 Not Found\n";
    auto recs = m_recommender->recommend(args[0], args[1], m_store->getData());
    std::ostringstream oss; oss << "200 Ok\n\n";
    for (size_t i = 0; i < recs.size(); ++i) { if (i > 0) oss << ' '; oss << recs[i]; }
    oss << "\n"; return oss.str();
}
std::string HelpCommand::commandName() const { return "help"; }
std::string HelpCommand::execute(const std::vector<std::string>& args) {
    return "DELETE, arguments: [userid] [productid1] [productid2]...\nGET, arguments: [userid] [productid]\nPATCH, arguments: [userid] [productid1] [productid2]...\nPOST, arguments: [userid] [productid1] [productid2]...\nhelp\n";
}
