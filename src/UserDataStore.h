#pragma once
#include "IDataStorage.h"
#include <memory>
class UserDataStore {
public:
    explicit UserDataStore(std::shared_ptr<IDataStorage> storage);
    void addProducts(const std::string& userId, const std::vector<std::string>& productIds);
    void removeProducts(const std::string& userId, const std::vector<std::string>& productIds);
    bool userExists(const std::string& userId) const;
    const std::unordered_map<std::string, std::unordered_set<std::string>>& getData() const;
private:
    std::shared_ptr<IDataStorage> m_storage;
    std::unordered_map<std::string, std::unordered_set<std::string>> m_data;
};
