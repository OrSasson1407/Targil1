#include "UserDataStore.h"
UserDataStore::UserDataStore(std::shared_ptr<IDataStorage> storage) : m_storage(std::move(storage)) { m_storage->load(m_data); }
void UserDataStore::addProducts(const std::string& userId, const std::vector<std::string>& productIds) {
    for (const auto& pid : productIds) m_data[userId].insert(pid);
    m_storage->save(userId, productIds);
}
void UserDataStore::removeProducts(const std::string& userId, const std::vector<std::string>& productIds) {
    for (const auto& pid : productIds) m_data[userId].erase(pid);
}
bool UserDataStore::userExists(const std::string& userId) const { return m_data.find(userId) != m_data.end(); }
const std::unordered_map<std::string, std::unordered_set<std::string>>& UserDataStore::getData() const { return m_data; }
