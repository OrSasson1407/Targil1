#pragma once
#include "ICommandHandler.h"
#include <ostream>

// Handles: help
// Prints the list of all supported commands.
class HelpCommand : public ICommandHandler {
public:
    explicit HelpCommand(std::ostream& output);

    std::string commandName() const override;
    bool execute(const std::vector<std::string>& args) override;

private:
    std::ostream& m_output;
};
