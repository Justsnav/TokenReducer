// ============================================================
// test_step1_step2.js
// Quick verification test for:
//   - sentenceAnalyzer.js  (Step 1)
//   - redundancyDetector.js (Step 2)
//
// Run with:  node test_step1_step2.js
// ============================================================

const { analyzeSentences } = require("./services/sentenceAnalyzer");
const { detectRedundancy, REDUNDANCY_THRESHOLD } = require("./services/redundancyDetector");

// ---------------------------------------------------------------
// Helper: pretty print with a section header
// ---------------------------------------------------------------
function section(title) {
    console.log("\n" + "=".repeat(60));
    console.log("  " + title);
    console.log("=".repeat(60));
}

// ================================================================
// TEST 1: Basic sentence splitting and word extraction
// ================================================================
section("TEST 1 — Basic sentence splitting");

const prompt1 = "Please explain binary search in detail. I want you to explain how binary search works!";
const result1 = analyzeSentences(prompt1);
console.log(JSON.stringify(result1, null, 2));

// ================================================================
// TEST 2: Technical term preservation
// ================================================================
section("TEST 2 — Technical term preservation");

const prompt2 = "Write a program in C++ that sorts an array. Use Node.js for the backend. The model is GPT-4.";
const result2 = analyzeSentences(prompt2);

result2.forEach(s => {
    console.log(`\nSentence: "${s.text}"`);
    console.log(`  words:          ${JSON.stringify(s.words)}`);
    console.log(`  meaningfulWords: ${JSON.stringify(s.meaningfulWords)}`);
});

// Check that technical terms survived
const allWords = result2.flatMap(s => s.words);
const checks = {
    "c++":     allWords.includes("c++"),
    "node.js": allWords.includes("node.js"),
    "gpt-4":   allWords.includes("gpt-4"),
};
console.log("\nTechnical term preservation:");
Object.entries(checks).forEach(([term, passed]) => {
    console.log(`  ${passed ? "✓" : "✗"} "${term}" ${passed ? "preserved" : "MISSING"}`);
});

// ================================================================
// TEST 3: Stop word filtering
// ================================================================
section("TEST 3 — Stop word filtering");

const prompt3 = "I want you to explain how binary search works in detail.";
const result3 = analyzeSentences(prompt3);
console.log("words:          ", result3[0].words);
console.log("meaningfulWords:", result3[0].meaningfulWords);
console.log("wordCount:          ", result3[0].wordCount);
console.log("meaningfulWordCount:", result3[0].meaningfulWordCount);

// ================================================================
// TEST 4: Redundancy detection — similar sentences
// ================================================================
section("TEST 4 — Redundancy detection (similar sentences)");

const prompt4 = `Please explain binary search in detail. I want you to explain how binary search works.`;
const sentences4 = analyzeSentences(prompt4);
const redundancy4 = detectRedundancy(sentences4);

console.log(`Threshold: ${REDUNDANCY_THRESHOLD}`);
console.log("\nSentences:");
sentences4.forEach(s => console.log(`  [${s.id}] "${s.text}" → meaningful: ${JSON.stringify(s.meaningfulWords)}`));
console.log("\nRedundancy results:");
console.log(JSON.stringify(redundancy4, null, 2));

// ================================================================
// TEST 5: Redundancy detection — clearly different sentences
// ================================================================
section("TEST 5 — Redundancy detection (different sentences)");

const prompt5 = `Explain binary search. Use Python for all examples. Return only the final code.`;
const sentences5 = analyzeSentences(prompt5);
const redundancy5 = detectRedundancy(sentences5);

console.log("Sentences:");
sentences5.forEach(s => console.log(`  [${s.id}] "${s.text}" → meaningful: ${JSON.stringify(s.meaningfulWords)}`));
console.log("\nRedundancy results (should be empty or low similarity):");
console.log(JSON.stringify(redundancy5, null, 2));

// ================================================================
// TEST 6: Edge cases
// ================================================================
section("TEST 6 — Edge cases");

console.log("Empty string:", analyzeSentences(""));
console.log("Whitespace only:", analyzeSentences("   "));
console.log("Single word:", analyzeSentences("Explain."));
console.log("C# preserved:", analyzeSentences("Use C# for this task.")[0].words);

console.log("\n" + "=".repeat(60));
console.log("  All tests complete.");
console.log("=".repeat(60) + "\n");
