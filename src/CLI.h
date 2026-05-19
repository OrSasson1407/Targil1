#pragma once
#include "ICommandHandler.h"
#include <memory>
#include <unordered_map>
#include <string>
class CLI {
public:
    void registerCommand(std::shared_ptr<ICommandHandler> handler);
    std::string executeLine(const std::string& line);
private:
    std::unordered_map<std::string, std::shared_ptr<ICommandHandler>> m_handlers;
    static std::vector<std::string> tokenise(const std::string& line);
};
