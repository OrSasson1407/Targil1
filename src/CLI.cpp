#include "CLI.h"
#include <sstream>

CLI::CLI(std::istream& input)
    : m_input(input) {}

void CLI::registerCommand(std::shared_ptr<ICommandHandler> handler) {
    m_handlers[handler->commandName()] = std::move(handler);
}

void CLI::run() {
    std::string line;
    while (std::getline(m_input, line)) {
        std::vector<std::string> tokens = tokenise(line);
        if (tokens.empty()) continue;

        const std::string& cmd = tokens[0];
        auto it = m_handlers.find(cmd);
        if (it == m_handlers.end()) continue;  // unknown command – silently ignore

        // Pass the remaining tokens as arguments; ignore invalid commands silently
        std::vector<std::string> args(tokens.begin() + 1, tokens.end());
        it->second->execute(args);  // return value ignored per spec
    }
}

// Split on space characters only (spec: fields separated by one or more spaces, no tabs).
std::vector<std::string> CLI::tokenise(const std::string& line) {
    std::vector<std::string> tokens;
    std::string token;
    for (char c : line) {
        if (c == ' ') {
            if (!token.empty()) {
                tokens.push_back(token);
                token.clear();
            }
        } else {
            token += c;
        }
    }
    if (!token.empty()) tokens.push_back(token);
    return tokens;
}
