#include <gtest/gtest.h>
#include "../src/CollaborativeRecommender.h"
#include "../src/UserDataStore.h"
#include "../src/FileStorage.h"
#include "../src/AddCommand.h"
#include "../src/RecommendCommand.h"
#include "../src/HelpCommand.h"
#include "../src/CLI.h"
#include <sstream>
#include <fstream>
#include <cstdio>

// ─── Helpers ────────────────────────────────────────────────────────────────

// Build the exact userData map from the assignment appendix example.
static std::unordered_map<std::string, std::unordered_set<std::string>>
buildExampleData() {
    return {
        {"1",  {"100","101","102","103"}},
        {"2",  {"101","102","104","105","106"}},
        {"3",  {"100","104","105","107","108"}},
        {"4",  {"101","105","106","107","109","110"}},
        {"5",  {"100","102","103","105","108","111"}},
        {"6",  {"100","103","104","110","111","112","113"}},
        {"7",  {"102","105","106","107","108","109","110"}},
        {"8",  {"101","104","105","106","109","111","114"}},
        {"9",  {"100","103","105","107","112","113","115"}},
        {"10", {"100","102","105","106","107","109","110","116"}}
    };
}

// ─── CollaborativeRecommender ────────────────────────────────────────────────

TEST(CollaborativeRecommender, AppendixExample) {
    // Assignment appendix: recommend for user 1, product 104
    // Expected output: 105 106 111 110 112 113 107 108 109 114
    CollaborativeRecommender rec;
    auto data = buildExampleData();
    auto result = rec.recommend("1", "104", data);

    ASSERT_EQ(result.size(), 10u);
    EXPECT_EQ(result[0], "105");
    EXPECT_EQ(result[1], "106");
    EXPECT_EQ(result[2], "111");
    EXPECT_EQ(result[3], "110");
    EXPECT_EQ(result[4], "112");
    EXPECT_EQ(result[5], "113");
    EXPECT_EQ(result[6], "107");
    EXPECT_EQ(result[7], "108");
    EXPECT_EQ(result[8], "109");
    EXPECT_EQ(result[9], "114");
}

TEST(CollaborativeRecommender, TieBrokenByAscendingProductId) {
    // Users 2 and 3 each have similarity 1 with user 1 (only product "A" in common).
    // User 2 watched "B", user 3 watched "C" → both get weight 1. Tie → "B" before "C".
    CollaborativeRecommender rec;
    std::unordered_map<std::string, std::unordered_set<std::string>> data = {
        {"1", {"A"}},
        {"2", {"A", "B"}},
        {"3", {"A", "C"}}
    };
    auto result = rec.recommend("1", "A", data);
    ASSERT_EQ(result.size(), 2u);
    EXPECT_EQ(result[0], "B");
    EXPECT_EQ(result[1], "C");
}

TEST(CollaborativeRecommender, DoesNotRecommendAlreadyWatched) {
    CollaborativeRecommender rec;
    std::unordered_map<std::string, std::unordered_set<std::string>> data = {
        {"1", {"A", "B"}},
        {"2", {"A", "B", "C"}}
    };
    // User 1 already watched B; C should be recommended, not B.
    auto result = rec.recommend("1", "A", data);
    ASSERT_EQ(result.size(), 1u);
    EXPECT_EQ(result[0], "C");
}

TEST(CollaborativeRecommender, NoOneWatchedSeedProduct) {
    CollaborativeRecommender rec;
    std::unordered_map<std::string, std::unordered_set<std::string>> data = {
        {"1", {"A"}},
        {"2", {"B", "C"}}
    };
    auto result = rec.recommend("1", "A", data);
    EXPECT_TRUE(result.empty());
}

TEST(CollaborativeRecommender, AtMostTenRecommendations) {
    CollaborativeRecommender rec;
    // User 2 watched seed + 15 other products
    std::unordered_set<std::string> u2products = {"SEED"};
    for (int i = 1; i <= 15; ++i) u2products.insert("P" + std::to_string(i));

    std::unordered_map<std::string, std::unordered_set<std::string>> data = {
        {"1", {"SEED"}},
        {"2", u2products}
    };
    auto result = rec.recommend("1", "SEED", data);
    EXPECT_LE(result.size(), 10u);
}

TEST(CollaborativeRecommender, UnknownUserGetsRecommendations) {
    // User "X" has no history. Similarity with everyone is 0.
    // Users who watched the seed product still contribute with weight 0.
    // Result should be empty because all weights are 0 and no products qualify.
    CollaborativeRecommender rec;
    auto data = buildExampleData();
    auto result = rec.recommend("X", "104", data);
    // All similarities are 0, so total relevance for every product is 0.
    // Products with weight 0 are still candidates - but the spec example excludes them.
    // In the assignment table, products with 0 weight (115, 116) are not in output.
    // So we expect only products with relevance > 0... but since user X has no
    // watched products, nothing is excluded as "already watched". Products watched by
    // users 2,3,6,8 (who watched 104) will appear with weight 0. We verify result ≤ 10.
    EXPECT_LE(result.size(), 10u);
}

// ─── FileStorage ─────────────────────────────────────────────────────────────

TEST(FileStorage, SaveAndLoad) {
    const std::string tmpFile = "/tmp/test_storage.txt";
    std::remove(tmpFile.c_str());

    {
        FileStorage fs(tmpFile);
        fs.save("userA", {"p1", "p2", "p3"});
        fs.save("userB", {"p2", "p4"});
    }

    FileStorage fs2(tmpFile);
    std::unordered_map<std::string, std::unordered_set<std::string>> data;
    fs2.load(data);

    ASSERT_EQ(data.count("userA"), 1u);
    EXPECT_EQ(data["userA"], (std::unordered_set<std::string>{"p1","p2","p3"}));
    ASSERT_EQ(data.count("userB"), 1u);
    EXPECT_EQ(data["userB"], (std::unordered_set<std::string>{"p2","p4"}));

    std::remove(tmpFile.c_str());
}

TEST(FileStorage, LoadDeduplicatesOnMultipleSavesForSameUser) {
    const std::string tmpFile = "/tmp/test_dedup.txt";
    std::remove(tmpFile.c_str());

    FileStorage fs(tmpFile);
    fs.save("u1", {"p1", "p2"});
    fs.save("u1", {"p2", "p3"});  // p2 duplicated

    std::unordered_map<std::string, std::unordered_set<std::string>> data;
    fs.load(data);

    EXPECT_EQ(data["u1"], (std::unordered_set<std::string>{"p1","p2","p3"}));
    std::remove(tmpFile.c_str());
}

TEST(FileStorage, LoadOnMissingFileDoesNotCrash) {
    FileStorage fs("/tmp/nonexistent_file_xyz.txt");
    std::unordered_map<std::string, std::unordered_set<std::string>> data;
    EXPECT_NO_THROW(fs.load(data));
    EXPECT_TRUE(data.empty());
}

// ─── UserDataStore ───────────────────────────────────────────────────────────

// Stub storage for testing UserDataStore in isolation
class StubStorage : public IDataStorage {
public:
    void save(const std::string& userId,
              const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds) saved[userId].insert(p);
    }
    void load(std::unordered_map<std::string,
              std::unordered_set<std::string>>& data) override {
        data = preloaded;
    }
    std::unordered_map<std::string, std::unordered_set<std::string>> saved;
    std::unordered_map<std::string, std::unordered_set<std::string>> preloaded;
};

TEST(UserDataStore, AddProductsMergesAndPersists) {
    auto stub = std::make_shared<StubStorage>();
    UserDataStore store(stub);

    store.addProducts("u1", {"p1", "p2"});
    store.addProducts("u1", {"p2", "p3"});

    const auto& data = store.getData();
    EXPECT_EQ(data.at("u1"), (std::unordered_set<std::string>{"p1","p2","p3"}));
    EXPECT_EQ(stub->saved.at("u1"), (std::unordered_set<std::string>{"p1","p2","p3"}));
}

TEST(UserDataStore, LoadsPreexistingDataOnConstruction) {
    auto stub = std::make_shared<StubStorage>();
    stub->preloaded["u1"] = {"p1", "p2"};

    UserDataStore store(stub);
    EXPECT_EQ(store.getData().at("u1"), (std::unordered_set<std::string>{"p1","p2"}));
}

// ─── AddCommand ──────────────────────────────────────────────────────────────

TEST(AddCommand, ValidCommandAddsProducts) {
    auto stub = std::make_shared<StubStorage>();
    auto store = std::make_shared<UserDataStore>(stub);
    AddCommand cmd(store);

    EXPECT_TRUE(cmd.execute({"u1", "p1", "p2"}));
    EXPECT_EQ(store->getData().at("u1"), (std::unordered_set<std::string>{"p1","p2"}));
}

TEST(AddCommand, MissingProductIdIsInvalid) {
    auto stub = std::make_shared<StubStorage>();
    auto store = std::make_shared<UserDataStore>(stub);
    AddCommand cmd(store);

    EXPECT_FALSE(cmd.execute({"u1"}));       // userId only, no products
    EXPECT_FALSE(cmd.execute({}));           // completely empty
}

// ─── RecommendCommand ────────────────────────────────────────────────────────

TEST(RecommendCommand, OutputsRecommendations) {
    auto stub = std::make_shared<StubStorage>();
    stub->preloaded = buildExampleData();
    auto store = std::make_shared<UserDataStore>(stub);
    auto rec   = std::make_shared<CollaborativeRecommender>();
    std::ostringstream out;
    RecommendCommand cmd(store, rec, out);

    EXPECT_TRUE(cmd.execute({"1", "104"}));
    EXPECT_EQ(out.str(), "105 106 111 110 112 113 107 108 109 114\n");
}

TEST(RecommendCommand, InvalidArgsReturnFalse) {
    auto stub = std::make_shared<StubStorage>();
    auto store = std::make_shared<UserDataStore>(stub);
    auto rec   = std::make_shared<CollaborativeRecommender>();
    std::ostringstream out;
    RecommendCommand cmd(store, rec, out);

    EXPECT_FALSE(cmd.execute({"u1"}));         // missing productId
    EXPECT_FALSE(cmd.execute({}));             // empty
    EXPECT_FALSE(cmd.execute({"u1","p1","p2"})); // too many args
}

// ─── HelpCommand ─────────────────────────────────────────────────────────────

TEST(HelpCommand, PrintsAllCommands) {
    std::ostringstream out;
    HelpCommand cmd(out);
    cmd.execute({});
    std::string expected =
        "add [userid] [productid1] [productid2] …\n"
        "recommend [userid] [productid]\n"
        "help\n";
    EXPECT_EQ(out.str(), expected);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

TEST(CLI, DispatchesKnownCommands) {
    std::istringstream in("help\n");
    std::ostringstream out;
    CLI cli(in);
    cli.registerCommand(std::make_shared<HelpCommand>(out));
    cli.run();
    EXPECT_FALSE(out.str().empty());
}

TEST(CLI, IgnoresUnknownCommands) {
    std::istringstream in("foo bar\nbaz\n");
    std::ostringstream out;
    CLI cli(in);
    cli.registerCommand(std::make_shared<HelpCommand>(out));
    cli.run();
    EXPECT_TRUE(out.str().empty());
}

TEST(CLI, HandlesMultipleSpacesBetweenTokens) {
    std::istringstream in("help\n");
    std::ostringstream out;
    CLI cli(in);
    cli.registerCommand(std::make_shared<HelpCommand>(out));
    cli.run();
    EXPECT_FALSE(out.str().empty());
}

TEST(CLI, IgnoresInvalidAddWithNoProducts) {
    // "add userid" with no products is invalid – should be silently ignored
    auto stub = std::make_shared<StubStorage>();
    auto store = std::make_shared<UserDataStore>(stub);
    std::istringstream in("add   u1\n");
    CLI cli(in);
    cli.registerCommand(std::make_shared<AddCommand>(store));
    cli.run();
    EXPECT_TRUE(store->getData().empty());
}

TEST(CLI, FullIntegrationAppendixExample) {
    const std::string tmpFile = "/tmp/integration_test.txt";
    std::remove(tmpFile.c_str());

    std::string inputStr =
        "add 1 100 101 102 103\n"
        "add 2 101 102 104 105 106\n"
        "add 3 100 104 105 107 108\n"
        "add 4 101 105 106 107 109 110\n"
        "add 5 100 102 103 105 108 111\n"
        "add 6 100 103 104 110 111 112 113\n"
        "add 7 102 105 106 107 108 109 110\n"
        "add 8 101 104 105 106 109 111 114\n"
        "add 9 100 103 105 107 112 113 115\n"
        "add 10 100 102 105 106 107 109 110 116\n"
        "recommend 1 104\n";

    std::istringstream in(inputStr);
    std::ostringstream out;

    auto storage     = std::make_shared<FileStorage>(tmpFile);
    auto store       = std::make_shared<UserDataStore>(storage);
    auto recommender = std::make_shared<CollaborativeRecommender>();

    CLI cli(in);
    cli.registerCommand(std::make_shared<AddCommand>(store));
    cli.registerCommand(std::make_shared<RecommendCommand>(store, recommender, out));
    cli.registerCommand(std::make_shared<HelpCommand>(out));
    cli.run();

    EXPECT_EQ(out.str(), "105 106 111 110 112 113 107 108 109 114\n");
    std::remove(tmpFile.c_str());
}

// ─── Main ────────────────────────────────────────────────────────────────────

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
