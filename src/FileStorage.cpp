#include "FileStorage.h"
#include <fstream>
#include <sstream>

FileStorage::FileStorage(const std::string& filePath)
    : m_filePath(filePath) {}

// Append a new line "userId p1 p2 ..." to the data file.
void FileStorage::save(const std::string& userId,
                       const std::vector<std::string>& productIds) {
    std::ofstream ofs(m_filePath, std::ios::app);
    if (!ofs.is_open()) return;

    ofs << userId;
    for (const auto& pid : productIds) {
        ofs << ' ' << pid;
    }
    ofs << '\n';
}

// Read every line and merge products into the data map.
void FileStorage::load(std::unordered_map<std::string,
                       std::unordered_set<std::string>>& data) {
    std::ifstream ifs(m_filePath);
    if (!ifs.is_open()) return;  // No file yet – nothing to load

    std::string line;
    while (std::getline(ifs, line)) {
        if (line.empty()) continue;

        std::istringstream iss(line);
        std::string token;
        std::string userId;
        bool first = true;

        while (iss >> token) {
            if (first) {
                userId = token;
                first = false;
            } else {
                data[userId].insert(token);
            }
        }
    }
}
