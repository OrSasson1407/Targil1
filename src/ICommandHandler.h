#pragma once
#include <string>
#include <vector>

// Interface for a single CLI command handler (Single Responsibility + Open/Closed).
// Adding a new command means adding a new class, not modifying existing ones.
class ICommandHandler {
public:
    virtual ~ICommandHandler() = default;

    // Return the command keyword this handler owns (e.g. "add", "recommend").
    virtual std::string commandName() const = 0;

    // Execute the command with the given arguments.
    // Returns false if the arguments are invalid (caller should silently ignore).
    virtual bool execute(const std::vector<std::string>& args) = 0;
};
