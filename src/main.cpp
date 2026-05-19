#include "CLI.h"
#include "FileStorage.h"
#include "UserDataStore.h"
#include "CollaborativeRecommender.h"
#include "Commands.h"
#include <iostream>
#include <memory>
#include <string>
#include <cstring>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

int main(int argc, char* argv[]) {
    if (argc != 2) return 1;
    int port = std::stoi(argv[1]);
    auto storage = std::make_shared<FileStorage>("data/userdata.txt");
    auto store = std::make_shared<UserDataStore>(storage);
    auto recommender = std::make_shared<CollaborativeRecommender>();
    CLI cli;
    cli.registerCommand(std::make_shared<PostCommand>(store));
    cli.registerCommand(std::make_shared<PatchCommand>(store));
    cli.registerCommand(std::make_shared<DeleteCommand>(store));
    cli.registerCommand(std::make_shared<GetCommand>(store, recommender));
    cli.registerCommand(std::make_shared<HelpCommand>());

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1; setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    sockaddr_in address; address.sin_family = AF_INET; address.sin_addr.s_addr = INADDR_ANY; address.sin_port = htons(port);
    bind(server_fd, (struct sockaddr*)&address, sizeof(address));
    listen(server_fd, 3);

    while (true) {
        int new_socket = accept(server_fd, nullptr, nullptr);
        if (new_socket < 0) continue;
        char buffer[1024] = {0};
        while (true) {
            memset(buffer, 0, 1024);
            int valread = read(new_socket, buffer, 1024);
            if (valread <= 0) break; 
            std::string response = cli.executeLine(std::string(buffer));
            send(new_socket, response.c_str(), response.length(), 0);
        }
        close(new_socket);
    }
    return 0;
}
