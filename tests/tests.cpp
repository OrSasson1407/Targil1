#include <gtest/gtest.h>
#include "../src/CollaborativeRecommender.h"
#include "../src/UserDataStore.h"
#include "../src/FileStorage.h"
#include "../src/Commands.h"
#include "../src/CLI.h"
#include <sstream>
#include <fstream>
#include <cstdio>

static std::unordered_map<std::string, std::unordered_set<std::string>> buildExampleData() {
    return {
        {"1",  {"100","101","102","103"}}, {"2",  {"101","102","104","105","106"}},
        {"3",  {"100","104","105","107","108"}}, {"4",  {"101","105","106","107","109","110"}},
        {"5",  {"100","102","103","105","108","111"}}, {"6",  {"100","103","104","110","111","112","113"}},
        {"7",  {"102","105","106","107","108","109","110"}}, {"8",  {"101","104","105","106","109","111","114"}},
        {"9",  {"100","103","105","107","112","113","115"}}, {"10", {"100","102","105","106","107","109","110","116"}}
    };
}
class StubStorage : public IDataStorage {
public:
    void save(const std::string& userId, const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds) saved[userId].insert(p);
    }
    void load(std::unordered_map<std::string, std::unordered_set<std::string>>& data) override { data = preloaded; }
    std::unordered_map<std::string, std::unordered_set<std::string>> saved, preloaded;
};

TEST(CollaborativeRecommender, AppendixExample) {
    CollaborativeRecommender rec; auto data = buildExampleData();
    auto result = rec.recommend("1", "104", data);
    ASSERT_EQ(result.size(), 10u); EXPECT_EQ(result[0], "105"); EXPECT_EQ(result[9], "114");
}
TEST(PostCommand, CreatesNewUser) {
    auto stub = std::make_shared<StubStorage>(); auto store = std::make_shared<UserDataStore>(stub); PostCommand cmd(store);
    EXPECT_EQ(cmd.execute({"u1", "p1", "p2"}), "201 Created\n"); EXPECT_TRUE(store->userExists("u1"));
}
TEST(PostCommand, FailsOnExistingUser) {
    auto stub = std::make_shared<StubStorage>(); stub->preloaded["u1"] = {"p1"}; auto store = std::make_shared<UserDataStore>(stub); PostCommand cmd(store);
    EXPECT_EQ(cmd.execute({"u1", "p2"}), "404 Not Found\n");
}
TEST(PatchCommand, UpdatesExistingUser) {
    auto stub = std::make_shared<StubStorage>(); stub->preloaded["u1"] = {"p1"}; auto store = std::make_shared<UserDataStore>(stub); PatchCommand cmd(store);
    EXPECT_EQ(cmd.execute({"u1", "p2"}), "204 No Content\n");
}
TEST(DeleteCommand, DeletesProducts) {
    auto stub = std::make_shared<StubStorage>(); stub->preloaded["u1"] = {"p1", "p2"}; auto store = std::make_shared<UserDataStore>(stub); DeleteCommand cmd(store);
    EXPECT_EQ(cmd.execute({"u1", "p1"}), "204 No Content\n"); EXPECT_FALSE(store->getData().at("u1").count("p1"));
}
TEST(GetCommand, OutputsRecommendations) {
    auto stub = std::make_shared<StubStorage>(); stub->preloaded = buildExampleData();
    auto store = std::make_shared<UserDataStore>(stub); auto rec = std::make_shared<CollaborativeRecommender>(); GetCommand cmd(store, rec);
    EXPECT_EQ(cmd.execute({"1", "104"}), "200 Ok\n\n105 106 111 110 112 113 107 108 109 114\n");
}
TEST(HelpCommand, PrintsAlphabeticalCommands) {
    HelpCommand cmd;
    std::string expected = "DELETE, arguments: [userid] [productid1] [productid2]...\nGET, arguments: [userid] [productid]\nPATCH, arguments: [userid] [productid1] [productid2]...\nPOST, arguments: [userid] [productid1] [productid2]...\nhelp\n";
    EXPECT_EQ(cmd.execute({}), expected);
}
TEST(CLI, DispatchesKnownCommands) { CLI cli; cli.registerCommand(std::make_shared<HelpCommand>()); EXPECT_NE(cli.executeLine("help\n"), "400 Bad Request\n"); }
TEST(CLI, ReturnsBadRequestForUnknown) { CLI cli; EXPECT_EQ(cli.executeLine("UNKNOWNCMD 1 2\n"), "400 Bad Request\n"); }

int main(int argc, char** argv) { ::testing::InitGoogleTest(&argc, argv); return RUN_ALL_TESTS(); }
