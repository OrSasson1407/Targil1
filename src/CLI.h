#pragma once
#include "ICommandHandler.h"
#include <istream>
#include <memory>
#include <unordered_map>
#include <string>

// Reads lines from an input stream, tokenises them (splitting on spaces only),
// dispatches to the matching ICommandHandler, and silently ignores invalid input.
// The loop runs forever (as required by the spec).
class CLI {
public:
    explicit CLI(std::istream& input);

    // Register a command handler. The handler's commandName() is used as the key.
    void registerCommand(std::shared_ptr<ICommandHandler> handler);

    // Start the read-dispatch loop. Never returns under normal operation.
    void run();

private:
    std::istream& m_input;
    std::unordered_map<std::string, std::shared_ptr<ICommandHandler>> m_handlers;

    // Split a line on ASCII space characters only (spec: no tabs).
    static std::vector<std::string> tokenise(const std::string& line);
};