#include "CLI.h"
void CLI::registerCommand(std::shared_ptr<ICommandHandler> handler) { m_handlers[handler->commandName()] = std::move(handler); }
std::string CLI::executeLine(const std::string& line) {
    std::vector<std::string> tokens = tokenise(line);
    if (tokens.empty()) return "400 Bad Request\n";
    auto it = m_handlers.find(tokens[0]);
    if (it == m_handlers.end()) return "400 Bad Request\n";
    std::vector<std::string> args(tokens.begin() + 1, tokens.end());
    return it->second->execute(args);
}
std::vector<std::string> CLI::tokenise(const std::string& line) {
    std::vector<std::string> tokens; std::string token;
    for (char c : line) {
        if (c == ' ' || c == '\r' || c == '\n') {
            if (!token.empty()) { tokens.push_back(token); token.clear(); }
        } else { token += c; }
    }
    if (!token.empty()) tokens.push_back(token);
    return tokens;
}
