#include "UserDataStore.h"

UserDataStore::UserDataStore(std::shared_ptr<IDataStorage> storage)
    : m_storage(std::move(storage)) {
    // Load all persisted data into memory on startup
    m_storage->load(m_data);
}

void UserDataStore::addProducts(const std::string& userId,
                                const std::vector<std::string>& productIds) {
    for (const auto& pid : productIds) {
        m_data[userId].insert(pid);
    }
    // Persist the raw entry as-is (storage accumulates; load deduplicates via set)
    m_storage->save(userId, productIds);
}

const std::unordered_map<std::string,
      std::unordered_set<std::string>>& UserDataStore::getData() const {
    return m_data;
}