#pragma once
#include "ICommandHandler.h"
#include "UserDataStore.h"
#include "IRecommender.h"
#include <memory>
class PostCommand : public ICommandHandler {
    std::shared_ptr<UserDataStore> m_store;
public:
    explicit PostCommand(std::shared_ptr<UserDataStore> store);
    std::string commandName() const override; std::string execute(const std::vector<std::string>& args) override;
};
class PatchCommand : public ICommandHandler {
    std::shared_ptr<UserDataStore> m_store;
public:
    explicit PatchCommand(std::shared_ptr<UserDataStore> store);
    std::string commandName() const override; std::string execute(const std::vector<std::string>& args) override;
};
class DeleteCommand : public ICommandHandler {
    std::shared_ptr<UserDataStore> m_store;
public:
    explicit DeleteCommand(std::shared_ptr<UserDataStore> store);
    std::string commandName() const override; std::string execute(const std::vector<std::string>& args) override;
};
class GetCommand : public ICommandHandler {
    std::shared_ptr<UserDataStore> m_store; std::shared_ptr<IRecommender> m_recommender;
public:
    GetCommand(std::shared_ptr<UserDataStore> store, std::shared_ptr<IRecommender> recommender);
    std::string commandName() const override; std::string execute(const std::vector<std::string>& args) override;
};
class HelpCommand : public ICommandHandler {
public:
    std::string commandName() const override; std::string execute(const std::vector<std::string>& args) override;
};
