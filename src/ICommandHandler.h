#pragma once
#include <string>
#include <vector>
class ICommandHandler {
public:
    virtual ~ICommandHandler() = default;
    virtual std::string commandName() const = 0;
    virtual std::string execute(const std::vector<std::string>& args) = 0;
};
