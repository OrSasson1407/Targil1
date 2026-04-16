#include "HelpCommand.h"

HelpCommand::HelpCommand(std::ostream& output)
    : m_output(output) {}

std::string HelpCommand::commandName() const {
    return "help";
}

bool HelpCommand::execute(const std::vector<std::string>& args) {
    (void)args;  // help takes no arguments
    m_output << "add [userid] [productid1] [productid2] …\n";
    m_output << "recommend [userid] [productid]\n";
    m_output << "help\n";
    return true;
}
